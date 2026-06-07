import { IsString, IsOptional, IsBoolean, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateVehicleDto } from './create-vehicle.dto';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Company or Customer Name', example: 'XYZ Logistics' })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ description: 'Tamil Translation of Name' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nameTA?: string;

  @ApiPropertyOptional({ description: 'Contact Mobile Number', example: '9876543210' })
  @IsString()
  @IsOptional()
  @MaxLength(15)
  mobile?: string;

  @ApiPropertyOptional({ description: 'Contact Email' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({ description: 'Company Address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'GSTIN Number' })
  @IsString()
  @IsOptional()
  @MaxLength(15)
  gstin?: string;

  @ApiPropertyOptional({ description: 'Is this a preset/system customer?' })
  @IsBoolean()
  @IsOptional()
  isPreset?: boolean;

  @ApiPropertyOptional({ type: () => CreateVehicleDto, description: 'Optional initial vehicle to register with the customer' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateVehicleDto)
  vehicle?: CreateVehicleDto;
}
