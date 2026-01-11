import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService, Currency } from '@easyx/database';
import { Decimal } from '@easyx/database';
import { LedgerService } from '../ledger/ledger.service';
import { BalanceService } from '../ledger/balance.service';
import { RatesService } from './rates.service';
import { CreateSwapDto } from './dto/create-swap.dto';
import { GetQuoteDto } from './dto/get-quote.dto';
import { GetTradesDto } from './dto/get-trades.dto';

@Injectable()
export class ExchangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
    private readonly balanceService: BalanceService,
    private readonly ratesService: RatesService,
  ) {}

  async getQuote(query: GetQuoteDto) {
    const { fromCurrency, toCurrency, amount: amountStr } = query;
    const amount = new Decimal(amountStr);

    const rate = await this.ratesService.getRate(fromCurrency, toCurrency);
    const toAmount = amount.times(rate);

    return {
      fromCurrency,
      toCurrency,
      fromAmount: amount.toString(),
      toAmount: toAmount.toString(),
      rate: rate.toString(),
      expiresAt: new Date(Date.now() + 30000).toISOString(), // 30 seconds
    };
  }

  async executeSwap(userId: string, dto: CreateSwapDto) {
    const { fromCurrency, toCurrency, fromAmount: fromAmountStr } = dto;
    const fromAmount = new Decimal(fromAmountStr);

    if (fromAmount.lessThanOrEqualTo(0)) {
      throw new BadRequestException('Amount must be positive');
    }

    if (fromCurrency === toCurrency) {
      throw new BadRequestException('Cannot swap same currency');
    }

    // Get rate
    const rate = await this.ratesService.getRate(fromCurrency, toCurrency);
    const toAmount = fromAmount.times(rate);

    // Check balance
    const hasBalance = await this.balanceService.hasBalance(userId, fromCurrency, fromAmount);
    if (!hasBalance) {
      throw new BadRequestException('Insufficient balance');
    }

    // Execute swap in transaction
    return this.prisma.$transaction(async (tx) => {
      // Create trade record
      const trade = await tx.trade.create({
        data: {
          userId,
          fromCurrency,
          toCurrency,
          fromAmount,
          toAmount,
          rate,
        },
      });

      // Debit fromCurrency
      await this.ledgerService.debit({
        userId,
        currency: fromCurrency,
        amount: fromAmount,
        operation: 'swap',
        referenceId: trade.id,
      });

      // Credit toCurrency
      await this.ledgerService.credit({
        userId,
        currency: toCurrency,
        amount: toAmount,
        operation: 'swap',
        referenceId: trade.id,
      });

      return {
        id: trade.id,
        fromCurrency,
        toCurrency,
        fromAmount: fromAmount.toString(),
        toAmount: toAmount.toString(),
        rate: rate.toString(),
        createdAt: trade.createdAt,
      };
    });
  }

  async getUserTrades(userId: string, query: GetTradesDto) {
    const { fromCurrency, toCurrency, limit = 50, offset = 0 } = query;

    const where: Record<string, unknown> = { userId };
    if (fromCurrency) where.fromCurrency = fromCurrency;
    if (toCurrency) where.toCurrency = toCurrency;

    const [trades, total] = await Promise.all([
      this.prisma.trade.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.trade.count({ where }),
    ]);

    return { trades, total, limit, offset };
  }
}
