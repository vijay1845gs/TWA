import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { BillStatus, Prisma } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a gapless sequence number like SBT-2026-0001
   */
  private async generateBillNumber(tx: Prisma.TransactionClient): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SBT-L`; // Assuming Labour for now

    // Get and increment sequence atomically
    const sequence = await tx.billSequence.upsert({
      where: { prefix_year: { prefix, year } },
      update: { lastSeq: { increment: 1 } },
      create: { prefix, year, lastSeq: 1 },
    });

    const paddedSeq = sequence.lastSeq.toString().padStart(4, '0');
    return `${prefix}-${paddedSeq}`;
  }

  /**
   * Create a Draft Bill
   */
  async createDraft(createBillDto: CreateBillDto, createdById: string) {
    const { customerId, clientName: dtoClientName, vehicleId, vehicleNumber: dtoVehicleNumber, notes, items, language = 'EN' } = createBillDto;

    let customer = customerId ? await this.prisma.customer.findUnique({ where: { id: customerId } }) : null;
    if (!customer && dtoClientName) {
      customer = await this.prisma.customer.findFirst({ where: { name: dtoClientName } });
    }
    const clientName = customer ? customer.name : (dtoClientName || 'Unknown');

    let vehicleNumber = dtoVehicleNumber || null;
    if (vehicleId && !vehicleNumber) {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
      vehicleNumber = vehicle ? vehicle.plateNumber : null;
    }

    // We do all reads in standard client, writing as draft
    let subtotal = 0;
    let cgstAmt = 0;
    let sgstAmt = 0;
    let discountAmtTotal = 0;

    for (const item of items) {
      const discount = item.discount || 0;
      const lineTotal = item.quantity * item.unitPrice - discount;
      const taxAmt = item.taxPercent ? (lineTotal * item.taxPercent) / 100 : 0;
      
      subtotal += (item.quantity * item.unitPrice);
      discountAmtTotal += discount;
      cgstAmt += taxAmt / 2;
      sgstAmt += taxAmt / 2;
    }

    const taxableAmt = subtotal - discountAmtTotal;
    const grandTotal = taxableAmt + cgstAmt + sgstAmt;

    return this.prisma.bill.create({
      data: {
        id: `DRAFT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        status: BillStatus.DRAFT,
        customerId: customer?.id,
        vehicleId,
        clientName,
        vehicleNumber,
        notes,
        subtotal,
        discountAmt: discountAmtTotal,
        taxableAmt,
        cgstAmt,
        sgstAmt,
        igstAmt: 0,
        grandTotal,
        createdById,
        language,
        items: {
          create: items.map(item => {
            const itemDiscount = item.discount || 0;
            const lineTotal = item.quantity * item.unitPrice - itemDiscount;
            const itemTax = item.taxPercent ? (lineTotal * item.taxPercent) / 100 : 0;
            return {
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountAmt: itemDiscount,
              taxPercent: item.taxPercent || 0,
              taxAmt: itemTax,
              subtotal: lineTotal + itemTax,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });
  }

  /**
   * Update a Draft Bill
   */
  async updateDraft(id: string, updateBillDto: CreateBillDto) {
    const { customerId, clientName: dtoClientName, vehicleId, vehicleNumber: dtoVehicleNumber, notes, items, language } = updateBillDto;

    const bill = await this.prisma.bill.findUnique({ where: { id } });
    if (!bill) throw new NotFoundException('Bill not found');
    if (bill.status !== BillStatus.DRAFT) {
      throw new BadRequestException('Only draft bills can be updated');
    }

    let customer = customerId ? await this.prisma.customer.findUnique({ where: { id: customerId } }) : null;
    if (!customer && dtoClientName) {
      customer = await this.prisma.customer.findFirst({ where: { name: dtoClientName } });
    }
    const clientName = customer ? customer.name : (dtoClientName || 'Unknown');

    let vehicleNumber = dtoVehicleNumber || null;
    if (vehicleId && !vehicleNumber) {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
      vehicleNumber = vehicle ? vehicle.plateNumber : null;
    }

    let subtotal = 0;
    let cgstAmt = 0;
    let sgstAmt = 0;
    let discountAmtTotal = 0;

    for (const item of items) {
      const discount = item.discount || 0;
      const lineTotal = item.quantity * item.unitPrice - discount;
      const taxAmt = item.taxPercent ? (lineTotal * item.taxPercent) / 100 : 0;
      
      subtotal += (item.quantity * item.unitPrice);
      discountAmtTotal += discount;
      cgstAmt += taxAmt / 2;
      sgstAmt += taxAmt / 2;
    }

    const taxableAmt = subtotal - discountAmtTotal;
    const grandTotal = taxableAmt + cgstAmt + sgstAmt;

    return this.prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.billItem.deleteMany({ where: { billId: id } });

      // Update bill and create new items
      return tx.bill.update({
        where: { id },
        data: {
          customerId: customer?.id,
          vehicleId,
          clientName,
          vehicleNumber,
          notes,
          subtotal,
          discountAmt: discountAmtTotal,
          taxableAmt,
          cgstAmt,
          sgstAmt,
          igstAmt: 0,
          grandTotal,
          ...(language && { language }),
          items: {
            create: items.map(item => {
              const itemDiscount = item.discount || 0;
              const lineTotal = item.quantity * item.unitPrice - itemDiscount;
              const itemTax = item.taxPercent ? (lineTotal * item.taxPercent) / 100 : 0;
              return {
                productId: item.productId,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discountAmt: itemDiscount,
                taxPercent: item.taxPercent || 0,
                taxAmt: itemTax,
                subtotal: lineTotal + itemTax,
              };
            }),
          },
        },
        include: {
          items: true,
        },
      });
    });
  }

  /**
   * Finalize Bill: Assigns Invoice Number & Deducts Inventory atomically
   */
  async finalizeBill(id: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch bill with items
      const bill = await tx.bill.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!bill) throw new NotFoundException('Bill not found');
      if (bill.status !== BillStatus.DRAFT) {
        throw new BadRequestException(`Bill cannot be finalized because it is currently ${bill.status}`);
      }

      // 2. Process Inventory Deductions for Products
      for (const item of bill.items) {
        if (item.productId) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            include: { inventory: true },
          });

          if (!product || !product.inventory) {
            throw new InternalServerErrorException(`Inventory mapping missing for product ${item.productId}`);
          }

          // V1 STRICT INVENTORY: Check if stock is sufficient
          if (Number(product.inventory.stockQty) < Number(item.quantity)) {
            throw new BadRequestException(
              `Insufficient stock for ${product.name}. Required: ${item.quantity}, Available: ${product.inventory.stockQty}`
            );
          }

          // Deduct stock
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { stockQty: { decrement: item.quantity } },
          });
        }
      }

      // 3. Generate Invoice Number
      const billNumber = await this.generateBillNumber(tx);

      // 4. Mark as Finalized by creating a new record and deleting the draft
      // (because Prisma doesn't support changing @id if it breaks FKs easily, and we want a clean ID swap)
      const finalizedBill = await tx.bill.create({
        data: {
          id: billNumber,
          status: BillStatus.FINALIZED,
          customerId: bill.customerId,
          vehicleId: bill.vehicleId,
          clientName: bill.clientName,
          vehicleNumber: bill.vehicleNumber,
          subtotal: bill.subtotal,
          discountAmt: bill.discountAmt,
          taxableAmt: bill.taxableAmt,
          cgstAmt: bill.cgstAmt,
          sgstAmt: bill.sgstAmt,
          igstAmt: bill.igstAmt,
          grandTotal: bill.grandTotal,
          notes: bill.notes,
          createdById: bill.createdById,
          billedAt: new Date(),
          language: bill.language,
          items: {
            create: bill.items.map(item => ({
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountAmt: item.discountAmt,
              taxPercent: item.taxPercent,
              taxAmt: item.taxAmt,
              subtotal: item.subtotal,
              sortOrder: item.sortOrder,
            }))
          }
        },
        include: {
          items: true,
          customer: true,
          vehicle: true,
        },
      });

      await tx.bill.delete({ where: { id } });

      return finalizedBill;
    });
  }

  /**
   * Record a Payment against a Bill
   */
  async addPayment(billId: string, addPaymentDto: AddPaymentDto, recordedById: string) {
    return this.prisma.$transaction(async (tx) => {
      const bill = await tx.bill.findUnique({ 
        where: { id: billId },
        include: { payments: true }
      });
      if (!bill) throw new NotFoundException('Bill not found');
      if (bill.status === BillStatus.CANCELLED) {
        throw new BadRequestException('Cannot add payment to a cancelled bill');
      }

      const totalPaid = bill.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const balanceDue = Number(bill.grandTotal) - totalPaid;

      if (balanceDue < addPaymentDto.amount) {
        throw new BadRequestException('Payment amount exceeds balance due');
      }

      // Record Payment
      const payment = await tx.payment.create({
        data: {
          billId,
          amount: addPaymentDto.amount,
          method: addPaymentDto.method,
          reference: addPaymentDto.referenceId,
          notes: addPaymentDto.notes,
        },
      });

      return payment;
    });
  }

  /**
   * Cancel a Bill
   */
  async cancelBill(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const bill = await tx.bill.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!bill) throw new NotFoundException('Bill not found');
      if (bill.status === BillStatus.CANCELLED) return bill;

      // If it was finalized, we must restore inventory
      if (bill.status === BillStatus.FINALIZED) {
        for (const item of bill.items) {
          if (item.productId) {
            await tx.inventory.update({
              where: { productId: item.productId },
              data: { stockQty: { increment: item.quantity } },
            });
          }
        }
      }

      return tx.bill.update({
        where: { id },
        data: { status: BillStatus.CANCELLED },
      });
    });
  }

  /**
   * Fetch All Bills
   */
  async findAll(
    skip: number = 0, 
    take: number = 20, 
    status?: BillStatus,
    search?: string,
    startDate?: string,
    endDate?: string,
    customerId?: string,
  ) {
    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (search) {
      where.OR = [
        { id: { contains: search } },
        { clientName: { contains: search } },
        { vehicleNumber: { contains: search } }
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.bill.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { customer: true, items: true },
      }),
      this.prisma.bill.count({ where }),
    ]);

    return { data, total, skip, take };
  }

  /**
   * Fetch Single Bill Details
   */
  async findOne(id: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
        vehicle: true,
        receipt: true,
        createdBy: { select: { name: true, mobile: true } }
      },
    });

    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }
}

