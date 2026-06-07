import {
  Controller,
  Post,
  Body,
  Put,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  LoginDto,
  VerifyOtpDto,
  RefreshTokenDto,
  ChangePinDto,
  SetPinDto,
  RequestOtpDto,
} from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/request-otp  — first-time or forgotten PIN flow
  @Post('request-otp')
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to a registered mobile number' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 401, description: 'Mobile not registered' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.sendOtp(dto.mobile);
  }

  // POST /auth/login  — verify PIN → send OTP
  @Post('login')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify PIN and send OTP for 2FA' })
  @ApiResponse({ status: 200, description: 'OTP dispatched' })
  @ApiResponse({ status: 401, description: 'Invalid PIN' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // POST /auth/verify-otp  — verify OTP → issue JWT
  @Post('verify-otp')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and receive JWT access + refresh tokens' })
  @ApiResponse({ status: 200, description: 'Tokens issued' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  // POST /auth/refresh
  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and get new access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  // POST /auth/logout
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke refresh tokens and sign out' })
  logout(@CurrentUser() user: { id: string }) {
    return this.authService.logout(user.id);
  }

  // PUT /auth/change-pin  — authenticated PIN change
  @Put('change-pin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change the admin PIN' })
  changePin(@CurrentUser() user: { id: string }, @Body() dto: ChangePinDto) {
    return this.authService.changePin(user.id, dto);
  }

  // PUT /auth/set-pin  — admin sets a PIN for another user
  @Put('set-pin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set or reset PIN (self)' })
  setPin(@CurrentUser() user: { id: string }, @Body() dto: SetPinDto) {
    return this.authService.setPin(user.id, dto);
  }
}
