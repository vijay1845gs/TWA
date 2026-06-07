import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateServiceDto {
  @ApiProperty({ description: 'Service Name', example: 'Tanker Seam Welding' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Tamil Name' })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  nameTA?: string;

  @ApiPropertyOptional({ description: 'Default Rate' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  defaultRate?: number;

  @ApiPropertyOptional({ description: 'Is it a system service?', default: false })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;
}
