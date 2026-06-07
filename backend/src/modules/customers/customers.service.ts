import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const { vehicle, ...customerData } = createCustomerDto;

    return this.prisma.customer.create({
      data: {
        ...customerData,
        vehicles: vehicle
          ? {
              create: {
                plateNumber: vehicle.plateNumber,
                model: vehicle.model,
                type: vehicle.type,
              },
            }
          : undefined,
      },
      include: {
        vehicles: true,
      },
    });
  }

  async findAll(skip: number = 0, take: number = 20, search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { mobile: { contains: search } },
            { vehicles: { some: { plateNumber: { contains: search, mode: 'insensitive' as const } } } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { vehicles: true },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { data, total, skip, take };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { vehicles: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const { vehicle, ...customerData } = updateCustomerDto;

    await this.findOne(id);

    return this.prisma.customer.update({
      where: { id },
      data: customerData,
      include: { vehicles: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addVehicle(customerId: string, createVehicleDto: CreateVehicleDto) {
    await this.findOne(customerId);

    return this.prisma.vehicle.create({
      data: {
        ...createVehicleDto,
        customerId,
      },
    });
  }

  async getCustomerHistory(id: string) {
    await this.findOne(id);

    return this.prisma.bill.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: true,
      },
    });
  }
}

