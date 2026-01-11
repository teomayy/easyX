import { Injectable } from '@nestjs/common';
import { PrismaService, Currency } from '@easyx/database';
import { Decimal } from '@easyx/database';

@Injectable()
export class BalanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserBalances(userId: string) {
    const balances = await this.prisma.balance.findMany({
      where: { userId },
      select: {
        currency: true,
        available: true,
        held: true,
      },
    });

    // Return all currencies with zero balances if not found
    const allCurrencies = Object.values(Currency);
    const balanceMap = new Map(balances.map((b) => [b.currency, b]));

    return allCurrencies.map((currency) => {
      const balance = balanceMap.get(currency);
      return {
        currency,
        available: balance?.available ?? new Decimal(0),
        held: balance?.held ?? new Decimal(0),
        total: balance ? balance.available.plus(balance.held) : new Decimal(0),
      };
    });
  }

  async getBalance(userId: string, currency: Currency) {
    const balance = await this.prisma.balance.findUnique({
      where: {
        userId_currency: { userId, currency },
      },
    });

    return {
      currency,
      available: balance?.available ?? new Decimal(0),
      held: balance?.held ?? new Decimal(0),
      total: balance ? balance.available.plus(balance.held) : new Decimal(0),
    };
  }

  async hasBalance(userId: string, currency: Currency, amount: Decimal): Promise<boolean> {
    const balance = await this.getBalance(userId, currency);
    return balance.available.greaterThanOrEqualTo(amount);
  }

  async ensureBalance(userId: string, currency: Currency) {
    const existing = await this.prisma.balance.findUnique({
      where: { userId_currency: { userId, currency } },
    });

    if (!existing) {
      return this.prisma.balance.create({
        data: {
          userId,
          currency,
          available: new Decimal(0),
          held: new Decimal(0),
        },
      });
    }

    return existing;
  }
}
