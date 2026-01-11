import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LedgerService } from './ledger.service';
import { BalanceService } from './balance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GetHistoryDto } from './dto/get-history.dto';

@ApiTags('Ledger')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ledger')
export class LedgerController {
  constructor(
    private readonly ledgerService: LedgerService,
    private readonly balanceService: BalanceService,
  ) {}

  @Get('balances')
  @ApiOperation({ summary: 'Get all balances for current user' })
  async getBalances(@CurrentUser() user: { id: string }) {
    return this.balanceService.getUserBalances(user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get transaction history' })
  async getHistory(@CurrentUser() user: { id: string }, @Query() query: GetHistoryDto) {
    return this.ledgerService.getHistory(user.id, query);
  }
}
