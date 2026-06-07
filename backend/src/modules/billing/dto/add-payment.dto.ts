import { IsString, IsNumber, IsOptional, IsEnum, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class AddPaymentDto {
  @ApiProperty({ description: 'Payment Amount' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: PaymentMethod, description: 'Method of payment' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({ description: 'Reference ID (e.g., UPI Transaction ID)' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  referenceId?: string;

  @ApiPropertyOptional({ description: 'Any internal notes for this payment' })
  @IsString()
  @IsOptional()
  @MaxLength(250)
  notes?: string;
}
