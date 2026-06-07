import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────
  // CATEGORIES
  // ─────────────────────────────────────────────────────────────────
  async createCategory(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({ data: createCategoryDto });
  }

  async findAllCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  // ─────────────────────────────────────────────────────────────────
  // PRODUCTS & INVENTORY
  // ─────────────────────────────────────────────────────────────────
  async createProduct(createProductDto: CreateProductDto) {
    const { initialStock, lowStockThreshold, unit, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        inventory: productData.isService
          ? undefined
          : {
              create: {
                stockQty: initialStock || 0,
                lowStockThreshold: lowStockThreshold || 5,
                unit: unit || 'pcs',
              },
            },
      },
      include: {
        inventory: true,
        category: true,
      },
    });
  }

  async findAllProducts(skip: number = 0, take: number = 50, search?: string, categoryId?: string) {
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: { inventory: true, category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total, skip, take };
  }

  async findOneProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { inventory: true, category: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    await this.findOneProduct(id);
    
    const { initialStock, lowStockThreshold, unit, ...productData } = updateProductDto;

    return this.prisma.product.update({
      where: { id },
      data: productData,
      include: { inventory: true, category: true },
    });
  }

  async adjustInventory(productId: string, updateInventoryDto: UpdateInventoryDto) {
    const product = await this.findOneProduct(productId);
    
    if (product.isService) {
      throw new BadRequestException('Cannot adjust inventory for a service');
    }

    if (!product.inventory) {
      throw new NotFoundException(`Inventory record not found for product ${productId}`);
    }

    // Atomic increment/decrement
    return this.prisma.inventory.update({
      where: { productId },
      data: {
        stockQty: {
          increment: updateInventoryDto.quantityAdjust,
        },
      },
    });
  }

  async getLowStockAlerts() {
    // Return all products where stockQty <= lowStockThreshold
    const allInventory = await this.prisma.inventory.findMany({
      include: { product: true },
    });

    return allInventory.filter((inv) => Number(inv.stockQty) <= Number(inv.lowStockThreshold));
  }

  // ─────────────────────────────────────────────────────────────────
  // WELDING SERVICES
  // ─────────────────────────────────────────────────────────────────
  async createService(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({ data: createServiceDto });
  }

  async findAllServices() {
    return this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}

