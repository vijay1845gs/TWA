import { IsString, IsOptional, IsNumber, Min, ValidateNested, IsArray, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BillItemDto {
  @ApiPropertyOptional({ description: 'ID of the existing product or service' })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({ description: 'ID of the existing service' })
  @IsString()
  @IsOptional()
  serviceId?: string;

  @ApiProperty({ description: 'Name/Description of the item' })
  @IsString()
  @MaxLength(200)
  description: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ description: 'Unit Price' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Discount Amount (flat)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiProperty({ description: 'Tax percentage (e.g., 18 for 18% GST)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxPercent?: number;
}

export class CreateBillDto {
  @ApiPropertyOptional({ description: 'ID of the Customer' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Name of the Custom Client (if customerId not provided)' })
  @IsString()
  @IsOptional()
  clientName?: string;

  @ApiPropertyOptional({ description: 'ID of the Vehicle' })
  @IsString()
  @IsOptional()
  vehicleId?: string;

  @ApiPropertyOptional({ description: 'Free-text Vehicle Number' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  vehicleNumber?: string;

  @ApiPropertyOptional({ description: 'Internal remarks or notes' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @ApiProperty({ type: [BillItemDto], description: 'List of items in the bill' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillItemDto)
  items: BillItemDto[];

  @ApiPropertyOptional({ description: 'Invoice language (EN or TA)' })
  @IsString()
  @IsOptional()
  language?: string;
}
