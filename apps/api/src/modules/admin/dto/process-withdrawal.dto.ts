import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessWithdrawalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
