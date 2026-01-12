import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService, Currency, Network, WithdrawalStatus } from '@easyx/database';
import { Decimal } from '@easyx/database';
import { LedgerService } from '../ledger/ledger.service';
import { BalanceService } from '../ledger/balance.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { GetWithdrawalsDto } from './dto/get-withdrawals.dto';

const NETWORK_FEES: Record<Network, Decimal> = {
  [Network.BTC]: new Decimal('0.0001'),
  [Network.LTC]: new Decimal('0.001'),
  [Network.TRC20]: new Decimal('1'),
  [Network.ERC20]: new Decimal('5'),
};

const MIN_WITHDRAWALS: Record<Network, Decimal> = {
  [Network.BTC]: new Decimal('0.001'),
  [Network.LTC]: new Decimal('0.01'),
  [Network.TRC20]: new Decimal('10'),
  [Network.ERC20]: new Decimal('20'),
};

@Injectable()
export class WithdrawalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
    private readonly balanceService: BalanceService,
    private readonly configService: ConfigService,
  ) {}

  async createWithdrawal(userId: string, dto: CreateWithdrawalDto) {
    const { currency, network, address, amount: amountStr } = dto;
    const amount = new Decimal(amountStr);
    const fee = NETWORK_FEES[network];
    const minWithdrawal = MIN_WITHDRAWALS[network];

    // Validate minimum
    if (amount.lessThan(minWithdrawal)) {
      throw new BadRequestException(`Minimum withdrawal is ${minWithdrawal} ${currency}`);
    }

    // Check balance
    const totalAmount = amount.plus(fee);
    const hasBalance = await this.balanceService.hasBalance(userId, currency, totalAmount);
    if (!hasBalance) {
      throw new BadRequestException('Insufficient balance');
    }

    // Check daily/monthly limits
    await this.checkLimits(userId, currency, amount);

    // Create withdrawal in transaction
    return this.prisma.$transaction(async (tx) => {
      // Hold funds
      await this.ledgerService.hold({
        userId,
        currency,
        amount: totalAmount,
        operation: 'withdrawal',
        referenceId: 'pending',
      });

      // Create withdrawal record
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId,
          currency,
          network,
          address,
          amount,
          fee,
          status: WithdrawalStatus.PENDING,
        },
      });

      return withdrawal;
    });
  }

  async processWithdrawal(withdrawalId: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal || withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new Error('Invalid withdrawal');
    }

    // TODO: Send actual blockchain transaction
    // This is where you'd call the hot wallet to send funds

    // For now, simulate processing
    return this.completeWithdrawal(withdrawalId, 'mock-tx-hash');
  }

  async completeWithdrawal(withdrawalId: string, txHash: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Release held funds (debit them)
      const totalAmount = withdrawal.amount.plus(withdrawal.fee);
      await this.ledgerService.release({
        userId: withdrawal.userId,
        currency: withdrawal.currency,
        amount: totalAmount,
        operation: 'withdrawal',
        referenceId: withdrawalId,
      });

      // Debit from held balance is already done via release
      // Now we need to actually debit from the user
      await this.ledgerService.debit({
        userId: withdrawal.userId,
        currency: withdrawal.currency,
        amount: totalAmount,
        operation: 'withdrawal_complete',
        referenceId: withdrawalId,
      });

      // Update withdrawal status
      return tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: WithdrawalStatus.COMPLETED,
          txHash,
        },
      });
    });
  }

  async rejectWithdrawal(withdrawalId: string, _reason: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal || withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new Error('Invalid withdrawal');
    }

    return this.prisma.$transaction(async (tx) => {
      // Release held funds back to available
      const totalAmount = withdrawal.amount.plus(withdrawal.fee);
      await this.ledgerService.release({
        userId: withdrawal.userId,
        currency: withdrawal.currency,
        amount: totalAmount,
        operation: 'withdrawal_rejected',
        referenceId: withdrawalId,
      });

      // Credit back to available
      await this.ledgerService.credit({
        userId: withdrawal.userId,
        currency: withdrawal.currency,
        amount: totalAmount,
        operation: 'withdrawal_refund',
        referenceId: withdrawalId,
      });

      return tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: WithdrawalStatus.REJECTED,
        },
      });
    });
  }

  async getUserWithdrawals(userId: string, query: GetWithdrawalsDto) {
    const { currency, status, limit = 50, offset = 0 } = query;

    const where: Record<string, unknown> = { userId };
    if (currency) where.currency = currency;
    if (status) where.status = status;

    const [withdrawals, total] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.withdrawal.count({ where }),
    ]);

    return { withdrawals, total, limit, offset };
  }

  getFees() {
    return {
      BTC: { network: 'BTC', fee: NETWORK_FEES[Network.BTC].toString(), min: MIN_WITHDRAWALS[Network.BTC].toString() },
      LTC: { network: 'LTC', fee: NETWORK_FEES[Network.LTC].toString(), min: MIN_WITHDRAWALS[Network.LTC].toString() },
      TRC20: { network: 'TRC20', fee: NETWORK_FEES[Network.TRC20].toString(), min: MIN_WITHDRAWALS[Network.TRC20].toString() },
      ERC20: { network: 'ERC20', fee: NETWORK_FEES[Network.ERC20].toString(), min: MIN_WITHDRAWALS[Network.ERC20].toString() },
    };
  }

  private async checkLimits(userId: string, currency: Currency, amount: Decimal) {
    // Get user KYC status
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });

    const isKyc = user?.kycStatus === 'VERIFIED';
    const dailyLimit = new Decimal(
      isKyc
        ? this.configService.get<number>('limits.dailyWithdrawKyc') ?? 50000
        : this.configService.get<number>('limits.dailyWithdrawNoKyc') ?? 1000,
    );

    // Calculate today's withdrawals
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayWithdrawals = await this.prisma.withdrawal.aggregate({
      where: {
        userId,
        currency,
        createdAt: { gte: today },
        status: { in: [WithdrawalStatus.PENDING, WithdrawalStatus.COMPLETED] },
      },
      _sum: { amount: true },
    });

    const todayTotal = todayWithdrawals._sum.amount ?? new Decimal(0);
    if (todayTotal.plus(amount).greaterThan(dailyLimit)) {
      throw new BadRequestException(`Daily withdrawal limit exceeded. Limit: ${dailyLimit} ${currency}`);
    }
  }
}
