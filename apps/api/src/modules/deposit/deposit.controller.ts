import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepositService } from './deposit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GetDepositsDto } from './dto/get-deposits.dto';

@ApiTags('Deposit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deposits')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Get()
  @ApiOperation({ summary: 'Get deposit history' })
  async getDeposits(@CurrentUser() user: { id: string }, @Query() query: GetDepositsDto) {
    return this.depositService.getUserDeposits(user.id, query);
  }
}
