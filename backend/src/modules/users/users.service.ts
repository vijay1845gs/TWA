import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, mobile: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, mobile: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException(`User ${id} not found.`);
    return user;
  }

  async findMe(id: string) {
    return this.findOne(id);
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { mobile: dto.mobile } });
    if (existing) throw new ConflictException('Mobile number already registered.');
    return this.prisma.user.create({
      data: { mobile: dto.mobile, name: dto.name, role: dto.role },
      select: { id: true, mobile: true, name: true, role: true, createdAt: true },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, mobile: true, name: true, role: true, updatedAt: true },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });
  }

  async updateAdminMobile(id: string, mobile: string) {
    await this.findOne(id);
    const formattedMobile = mobile.startsWith('+91') ? mobile : `+91${mobile}`;
    return this.prisma.user.update({
      where: { id },
      data: { mobile: formattedMobile },
      select: { id: true, mobile: true, name: true, role: true, updatedAt: true },
    });
  }
}
