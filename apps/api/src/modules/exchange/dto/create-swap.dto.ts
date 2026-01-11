import { IsEnum, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '@easyx/database';

export class CreateSwapDto {
  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  fromCurrency: Currency;

  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  toCurrency: Currency;

  @ApiProperty({ example: '100' })
  @IsNumberString()
  fromAmount: string;
}
