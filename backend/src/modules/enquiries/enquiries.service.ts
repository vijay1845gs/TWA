import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EnquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, mobile: string, description: string) {
    return this.prisma.enquiry.create({
      data: {
        name,
        mobile,
        description,
      },
    });
  }

  async findAll(skip: number = 0, take: number = 20) {
    const [data, total] = await Promise.all([
      this.prisma.enquiry.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.enquiry.count(),
    ]);

    return { data, total, skip, take };
  }
}
