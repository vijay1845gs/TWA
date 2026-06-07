import { IsNumber, IsString, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateInventoryDto {
  @ApiProperty({ description: 'Amount to add (positive) or subtract (negative)', example: 10 })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  quantityAdjust: number;

  @ApiPropertyOptional({ description: 'Reason for adjustment', example: 'Restock' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  reason?: string;
}
