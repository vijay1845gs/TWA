import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  LoginDto,
  VerifyOtpDto,
  ChangePinDto,
  SetPinDto,
} from './dto/auth.dto';

const BCRYPT_ROUNDS = 12;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_OTP_ATTEMPTS = 5;
const REFRESH_TOKEN_DAYS = 7;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ─── Generate & send OTP ──────────────────────────────────────
  async sendOtp(mobile?: string): Promise<{ message: string; expiresIn: number; otp?: string }> {
    let targetMobile = mobile;
    if (!targetMobile) {
      const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' } });
      if (!admin) throw new UnauthorizedException('No admin user found.');
      targetMobile = admin.mobile;
    }

    const user = await this.prisma.user.findUnique({ where: { mobile: targetMobile } });
    if (!user || !user.isActive) {
      // Don't reveal whether the user exists
      throw new UnauthorizedException('Mobile number not registered or inactive.');
    }

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    // Invalidate any previous unused OTPs for this mobile
    await this.prisma.otpRecord.updateMany({
      where: { mobile: targetMobile, isUsed: false },
      data: { isUsed: true },
    });

    await this.prisma.otpRecord.create({
      data: { mobile: targetMobile, otpHash, expiresAt },
    });

    await this.deliverOtp(targetMobile, otp);

    if (this.config.get('NODE_ENV') !== 'production') {
      return { message: 'OTP sent successfully.', expiresIn: 300, otp };
    }
    return { message: 'OTP sent successfully.', expiresIn: 300 };
  }

  // ─── Login: verify PIN → send OTP ─────────────────────────────
  async login(dto: LoginDto): Promise<{ message: string; expiresIn: number; otp?: string }> {
    let user;
    if (dto.mobile) {
      user = await this.prisma.user.findUnique({
        where: { mobile: dto.mobile },
        include: { pin: true },
      });
    } else {
      user = await this.prisma.user.findFirst({
        where: { role: 'ADMIN' },
        orderBy: { createdAt: 'asc' },
        include: { pin: true },
      });
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    if (!user.pin) {
      throw new BadRequestException('No PIN set. Please contact administrator.');
    }

    const pinValid = await bcrypt.compare(dto.pin, user.pin.pinHash);
    if (!pinValid) {
      throw new UnauthorizedException('Incorrect PIN.');
    }

    return this.sendOtp(user.mobile);
  }

  // ─── Verify OTP → issue tokens ────────────────────────────────
  async verifyOtp(dto: VerifyOtpDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; name: string; mobile: string; role: string };
    expiresIn: number;
  }> {
    let targetMobile = dto.mobile;
    if (!targetMobile) {
      const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' } });
      if (!admin) throw new UnauthorizedException('No admin user found.');
      targetMobile = admin.mobile;
    }

    const record = await this.prisma.otpRecord.findFirst({
      where: {
        mobile: targetMobile,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new UnauthorizedException('OTP has expired or is invalid.');
    }
    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await this.prisma.otpRecord.update({
        where: { id: record.id },
        data: { isUsed: true },
      });
      throw new UnauthorizedException('Too many failed attempts. Request a new OTP.');
    }

    const otpValid = await bcrypt.compare(dto.otp, record.otpHash);
    
    if (!otpValid) {
      await this.prisma.otpRecord.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Incorrect OTP.');
    }

    // Mark OTP as used
    await this.prisma.otpRecord.update({
      where: { id: record.id },
      data: { isUsed: true },
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { mobile: targetMobile },
    });

    const { accessToken, refreshToken } = await this.issueTokens(user.id, user.mobile, user.role);

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, mobile: user.mobile, role: user.role },
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  // ─── Refresh access token ─────────────────────────────────────
  async refreshTokens(rawRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { sub: string; mobile: string; role: string };
    try {
      payload = this.jwtService.verify(rawRefreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    const stored = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, isRevoked: false, expiresAt: { gt: new Date() } },
    });
    if (!stored) throw new UnauthorizedException('Session expired. Please log in again.');

    const tokenValid = await bcrypt.compare(rawRefreshToken, stored.tokenHash);
    if (!tokenValid) throw new UnauthorizedException('Refresh token mismatch.');

    // Rotate — revoke old, issue new
    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { isRevoked: true } });

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: payload.sub } });
    return this.issueTokens(user.id, user.mobile, user.role);
  }

  // ─── Logout ───────────────────────────────────────────────────
  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
    await this.prisma.auditLog.create({
      data: { userId, action: 'LOGOUT', entity: 'User', entityId: userId },
    });
  }

  // ─── Change PIN ───────────────────────────────────────────────
  async changePin(userId: string, dto: ChangePinDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { pin: true },
    });
    if (!user?.pin) throw new NotFoundException('User PIN not found.');

    const valid = await bcrypt.compare(dto.currentPin, user.pin.pinHash);
    if (!valid) throw new UnauthorizedException('Current PIN is incorrect.');

    const newHash = await bcrypt.hash(dto.newPin, BCRYPT_ROUNDS);
    await this.prisma.userPin.update({
      where: { userId },
      data: { pinHash: newHash },
    });
    await this.prisma.auditLog.create({
      data: { userId, action: 'UPDATE', entity: 'UserPin', entityId: userId },
    });
  }

  // ─── Set PIN (first time or admin reset) ─────────────────────
  async setPin(userId: string, dto: SetPinDto): Promise<void> {
    const pinHash = await bcrypt.hash(dto.pin, BCRYPT_ROUNDS);
    await this.prisma.userPin.upsert({
      where: { userId },
      create: { userId, pinHash },
      update: { pinHash },
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async deliverOtp(mobile: string, otp: string): Promise<void> {
    if (this.config.get('NODE_ENV') === 'production') {
      // TODO Sprint 7: integrate MSG91
      // await this.msg91Service.sendOtp(mobile, otp);
      this.logger.log(`[PROD] OTP for ${mobile}: ${otp}`); // remove after SMS integrated
    } else {
      // Dev: log OTP to console only
      this.logger.debug(`[DEV] OTP for ${mobile}: ${otp}`);
    }
    await this.prisma.auditLog.create({
      data: { action: 'OTP_SENT', entity: 'OtpRecord', newValues: { mobile } },
    });
  }

  private async issueTokens(
    userId: string,
    mobile: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, mobile, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: (this.config.get('JWT_ACCESS_EXPIRES_IN') || '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: (this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d') as any,
    });

    const tokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}
