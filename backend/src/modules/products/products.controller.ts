import { Controller, Get, Post, Body, Put, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Products & Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // CATEGORIES
  @Post('categories')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new category' })
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.productsService.createCategory(createCategoryDto);
  }

  @Get('categories')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'List all categories' })
  findAllCategories() {
    return this.productsService.findAllCategories();
  }

  // PRODUCTS
  @Post('products')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new product (and initialize inventory)' })
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get('products')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'List products (catalog)' })
  findAllProducts(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.productsService.findAllProducts(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 50,
      search,
      categoryId,
    );
  }

  @Get('products/:id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'Get a single product by ID' })
  findOneProduct(@Param('id') id: string) {
    return this.productsService.findOneProduct(id);
  }

  @Put('products/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update a product (Managers only)' })
  updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  // INVENTORY
  @Get('inventory/alerts')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get list of products that are below their low-stock threshold' })
  getLowStockAlerts() {
    return this.productsService.getLowStockAlerts();
  }

  @Put('inventory/:productId/adjust')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Manually increment/decrement inventory (Managers only)' })
  adjustInventory(
    @Param('productId') productId: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.productsService.adjustInventory(productId, updateInventoryDto);
  }

  // SERVICES
  @Post('services')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new welding service' })
  createService(@Body() createServiceDto: CreateServiceDto) {
    return this.productsService.createService(createServiceDto);
  }

  @Get('services')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'List all active welding services' })
  findAllServices() {
    return this.productsService.findAllServices();
  }
}

