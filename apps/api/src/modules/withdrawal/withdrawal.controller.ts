import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WithdrawalService } from './withdrawal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { GetWithdrawalsDto } from './dto/get-withdrawals.dto';

@ApiTags('Withdrawal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('withdrawals')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post()
  @ApiOperation({ summary: 'Create withdrawal request' })
  async createWithdrawal(@CurrentUser() user: { id: string }, @Body() dto: CreateWithdrawalDto) {
    return this.withdrawalService.createWithdrawal(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get withdrawal history' })
  async getWithdrawals(@CurrentUser() user: { id: string }, @Query() query: GetWithdrawalsDto) {
    return this.withdrawalService.getUserWithdrawals(user.id, query);
  }

  @Get('fees')
  @ApiOperation({ summary: 'Get withdrawal fees' })
  async getFees() {
    return this.withdrawalService.getFees();
  }
}
