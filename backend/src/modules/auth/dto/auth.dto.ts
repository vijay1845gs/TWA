import {
  IsString,
  IsMobilePhone,
  Length,
  IsNumberString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class RequestOtpDto {
  @ApiPropertyOptional({ example: '+919876543210', description: 'Indian mobile number (optional for admin login)' })
  @IsMobilePhone('en-IN', {}, { message: 'Enter a valid Indian mobile number' })
  @IsOptional()
  mobile?: string;
}

export class LoginDto {
  @ApiPropertyOptional({ example: '+919876543210' })
  @IsMobilePhone('en-IN', {}, { message: 'Enter a valid Indian mobile number' })
  @IsOptional()
  mobile?: string;

  @ApiProperty({ example: '123456', description: '6-digit numeric PIN' })
  @IsNumberString({}, { message: 'PIN must be numeric' })
  @Length(6, 6, { message: 'PIN must be exactly 6 digits' })
  pin: string;
}

export class VerifyOtpDto {
  @ApiPropertyOptional({ example: '+919876543210' })
  @IsMobilePhone('en-IN', {}, { message: 'Enter a valid Indian mobile number' })
  @IsOptional()
  mobile?: string;

  @ApiProperty({ example: '482910', description: '6-digit OTP received via SMS' })
  @IsNumberString({}, { message: 'OTP must be numeric' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ChangePinDto {
  @ApiProperty({ example: '123456', description: 'Current PIN' })
  @IsNumberString()
  @Length(6, 6)
  currentPin: string;

  @ApiProperty({ example: '654321', description: 'New 6-digit PIN' })
  @IsNumberString()
  @Length(6, 6)
  newPin: string;
}

export class SetPinDto {
  @ApiProperty({ example: '123456', description: 'New 6-digit PIN to set' })
  @IsNumberString()
  @Length(6, 6)
  pin: string;
}
