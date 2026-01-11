import { IsString, IsEnum, IsNumberString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from '@easyx/database';

export class CreateTransferDto {
  @ApiProperty({ description: 'Recipient username, phone, or user ID' })
  @IsString()
  recipient: string;

  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ example: '100' })
  @IsNumberString()
  amount: string;

  @ApiPropertyOptional({ example: 'Payment for services' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
