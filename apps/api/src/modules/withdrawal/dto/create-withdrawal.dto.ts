import { IsString, IsEnum, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency, Network } from '@easyx/database';

export class CreateWithdrawalDto {
  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ enum: Network })
  @IsEnum(Network)
  network: Network;

  @ApiProperty({ example: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' })
  @IsString()
  address: string;

  @ApiProperty({ example: '0.01' })
  @IsNumberString()
  amount: string;
}
