import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Vehicle Plate Number', example: 'TN-01-AB-1234' })
  @IsString()
  @MaxLength(20)
  plateNumber: string;

  @ApiPropertyOptional({ description: 'Vehicle Model', example: 'Tata Signa' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  model?: string;

  @ApiPropertyOptional({ description: 'Vehicle Type', example: 'Oil Tanker' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  type?: string;
}
