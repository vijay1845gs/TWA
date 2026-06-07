import { Controller, Get, Post, Body, Param, Put, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, BillStatus } from '@prisma/client';

@ApiTags('Billing Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bills')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('draft')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'Create a draft bill from cart items' })
  createDraft(@Body() createBillDto: CreateBillDto, @Request() req: any) {
    return this.billingService.createDraft(createBillDto, req.user.userId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'Update a draft bill' })
  updateDraft(@Param('id') id: string, @Body() updateBillDto: CreateBillDto) {
    return this.billingService.updateDraft(id, updateBillDto);
  }

  @Post(':id/finalize')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'Finalize a draft bill (Deducts Inventory & Generates SBT Invoice No.)' })
  finalizeBill(@Param('id') id: string) {
    return this.billingService.finalizeBill(id);
  }

  @Post(':id/payments')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'Record a receipt/payment against a finalized bill' })
  addPayment(@Param('id') id: string, @Body() addPaymentDto: AddPaymentDto, @Request() req: any) {
    return this.billingService.addPayment(id, addPaymentDto, req.user.userId);
  }

  @Post(':id/cancel')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Cancel an invoice and restore inventory (Managers only)' })
  cancelBill(@Param('id') id: string) {
    return this.billingService.cancelBill(id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'List all bills with optional status filter' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: BillStatus,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.billingService.findAll(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
      status,
      search,
      startDate,
      endDate,
      customerId,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'Get a full bill document including items and receipts' })
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }
}

