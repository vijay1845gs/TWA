import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Product Name', example: 'MS Welding Wire 1.2mm' })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ description: 'Tamil Name' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nameTA?: string;

  @ApiProperty({ description: 'Unique Stock Keeping Unit', example: 'MS-WW-12' })
  @IsString()
  @MaxLength(50)
  sku: string;

  @ApiPropertyOptional({ description: 'Barcode for scanning' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  barcode?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Base Unit Price' })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  unitPrice: number;

  @ApiProperty({ description: 'Tax Percentage (GST)', default: 18.00 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  taxPercent?: number;

  @ApiPropertyOptional({ description: 'Is this a service (no inventory)?', default: false })
  @IsBoolean()
  @IsOptional()
  isService?: boolean;

  @ApiPropertyOptional({ description: 'Initial stock quantity', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  initialStock?: number;

  @ApiPropertyOptional({ description: 'Low stock alert threshold', default: 5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  lowStockThreshold?: number;

  @ApiPropertyOptional({ description: 'Unit of measurement', default: 'pcs' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  unit?: string;
}
