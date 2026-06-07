import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BillStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalBillsAgg,
      totalCustomers,
      todayBillsAgg,
      monthBillsAgg,
      draftCount,
    ] = await Promise.all([
      this.prisma.bill.aggregate({
        where: { status: BillStatus.FINALIZED },
        _count: { id: true },
        _sum: { grandTotal: true },
      }),
      this.prisma.customer.count({ where: { isActive: true } }),
      this.prisma.bill.aggregate({
        where: { status: BillStatus.FINALIZED, billedAt: { gte: today } },
        _count: { id: true },
        _sum: { grandTotal: true },
      }),
      this.prisma.bill.aggregate({
        where: { status: BillStatus.FINALIZED, billedAt: { gte: firstDayOfMonth } },
        _count: { id: true },
        _sum: { grandTotal: true },
      }),
      this.prisma.bill.count({ where: { status: BillStatus.DRAFT } }),
    ]);

    return {
      totalRevenue: totalBillsAgg._sum.grandTotal || 0,
      totalBills: totalBillsAgg._count.id || 0,
      totalCustomers,
      todayRevenue: todayBillsAgg._sum.grandTotal || 0,
      todayBills: todayBillsAgg._count.id || 0,
      currentMonthRevenue: monthBillsAgg._sum.grandTotal || 0,
      currentMonthBills: monthBillsAgg._count.id || 0,
      totalDrafts: draftCount,
    };
  }

  async getRangeReport(from: Date, to: Date) {
    const bills = await this.prisma.bill.findMany({
      where: {
        status: BillStatus.FINALIZED,
        billedAt: {
          gte: from,
          lte: to,
        },
      },
      include: { customer: true },
      orderBy: { billedAt: 'desc' },
    });

    const totalRevenue = bills.reduce((sum, b) => sum + Number(b.grandTotal), 0);
    const totalTax = bills.reduce((sum, b) => sum + Number(b.cgstAmt) + Number(b.sgstAmt) + Number(b.igstAmt), 0);

    return {
      bills,
      summary: {
        totalRevenue,
        totalTax,
        totalBills: bills.length,
      },
    };
  }

  async getFourMonthPerformance() {
    const today = new Date();
    const months = [];
    
    for (let i = 3; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        start: d,
        end: new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59, 999),
      });
    }

    const data = await Promise.all(months.map(async (m) => {
      const agg = await this.prisma.bill.aggregate({
        where: {
          status: BillStatus.FINALIZED,
          billedAt: { gte: m.start, lte: m.end },
        },
        _count: { id: true },
        _sum: { grandTotal: true },
      });
      return {
        month: m.label,
        revenue: Number(agg._sum.grandTotal || 0),
        bills: agg._count.id || 0,
      };
    }));

    return data;
  }
}

