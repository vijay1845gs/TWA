import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(skip: number = 0, take: number = 20) {
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take,
        orderBy: { paidAt: 'desc' },
        include: { bill: { select: { id: true, clientName: true, vehicleNumber: true } } },
      }),
      this.prisma.payment.count(),
    ]);

    return { data, total, skip, take };
  }
}
