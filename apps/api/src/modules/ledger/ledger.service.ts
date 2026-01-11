import { Injectable } from '@nestjs/common';
import { PrismaService, Currency, EntryType } from '@easyx/database';
import { Decimal } from '@easyx/database';
import { GetHistoryDto } from './dto/get-history.dto';

interface LedgerOperationParams {
  userId: string;
  currency: Currency;
  amount: Decimal;
  type: EntryType;
  operation: string;
  referenceId: string;
}

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async credit(params: Omit<LedgerOperationParams, 'type'>) {
    return this.executeOperation({ ...params, type: EntryType.CREDIT });
  }

  async debit(params: Omit<LedgerOperationParams, 'type'>) {
    return this.executeOperation({ ...params, type: EntryType.DEBIT });
  }

  async hold(params: Omit<LedgerOperationParams, 'type'>) {
    return this.executeOperation({ ...params, type: EntryType.HOLD });
  }

  async release(params: Omit<LedgerOperationParams, 'type'>) {
    return this.executeOperation({ ...params, type: EntryType.RELEASE });
  }

  private async executeOperation(params: LedgerOperationParams) {
    const { userId, currency, amount, type, operation, referenceId } = params;

    return this.prisma.$transaction(async (tx) => {
      // Get or create balance
      let balance = await tx.balance.findUnique({
        where: {
          userId_currency: { userId, currency },
        },
      });

      if (!balance) {
        balance = await tx.balance.create({
          data: {
            userId,
            currency,
            available: new Decimal(0),
            held: new Decimal(0),
          },
        });
      }

      const balanceBefore = balance.available;
      let newAvailable = balance.available;
      let newHeld = balance.held;

      switch (type) {
        case EntryType.CREDIT:
          newAvailable = balance.available.plus(amount);
          break;
        case EntryType.DEBIT:
          if (balance.available.lessThan(amount)) {
            throw new Error('Insufficient balance');
          }
          newAvailable = balance.available.minus(amount);
          break;
        case EntryType.HOLD:
          if (balance.available.lessThan(amount)) {
            throw new Error('Insufficient balance');
          }
          newAvailable = balance.available.minus(amount);
          newHeld = balance.held.plus(amount);
          break;
        case EntryType.RELEASE:
          if (balance.held.lessThan(amount)) {
            throw new Error('Insufficient held balance');
          }
          newHeld = balance.held.minus(amount);
          break;
      }

      // Update balance
      const updatedBalance = await tx.balance.update({
        where: {
          userId_currency: { userId, currency },
        },
        data: {
          available: newAvailable,
          held: newHeld,
        },
      });

      // Create ledger entry
      const entry = await tx.ledgerEntry.create({
        data: {
          userId,
          currency,
          amount,
          type,
          operation,
          referenceId,
          balanceBefore,
          balanceAfter: updatedBalance.available,
        },
      });

      return { entry, balance: updatedBalance };
    });
  }

  async transfer(params: {
    fromUserId: string;
    toUserId: string;
    currency: Currency;
    amount: Decimal;
    operation: string;
    referenceId: string;
  }) {
    const { fromUserId, toUserId, currency, amount, operation, referenceId } = params;

    return this.prisma.$transaction(async (tx) => {
      // Debit from sender
      const fromBalance = await tx.balance.findUnique({
        where: { userId_currency: { userId: fromUserId, currency } },
      });

      if (!fromBalance || fromBalance.available.lessThan(amount)) {
        throw new Error('Insufficient balance');
      }

      await tx.balance.update({
        where: { userId_currency: { userId: fromUserId, currency } },
        data: { available: fromBalance.available.minus(amount) },
      });

      await tx.ledgerEntry.create({
        data: {
          userId: fromUserId,
          currency,
          amount,
          type: EntryType.DEBIT,
          operation,
          referenceId,
          balanceBefore: fromBalance.available,
          balanceAfter: fromBalance.available.minus(amount),
        },
      });

      // Credit to receiver
      let toBalance = await tx.balance.findUnique({
        where: { userId_currency: { userId: toUserId, currency } },
      });

      if (!toBalance) {
        toBalance = await tx.balance.create({
          data: {
            userId: toUserId,
            currency,
            available: new Decimal(0),
            held: new Decimal(0),
          },
        });
      }

      await tx.balance.update({
        where: { userId_currency: { userId: toUserId, currency } },
        data: { available: toBalance.available.plus(amount) },
      });

      await tx.ledgerEntry.create({
        data: {
          userId: toUserId,
          currency,
          amount,
          type: EntryType.CREDIT,
          operation,
          referenceId,
          balanceBefore: toBalance.available,
          balanceAfter: toBalance.available.plus(amount),
        },
      });

      return { success: true };
    });
  }

  async getHistory(userId: string, query: GetHistoryDto) {
    const { currency, operation, limit = 50, offset = 0 } = query;

    const where: Record<string, unknown> = { userId };
    if (currency) where.currency = currency;
    if (operation) where.operation = operation;

    const [entries, total] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.ledgerEntry.count({ where }),
    ]);

    return {
      entries,
      total,
      limit,
      offset,
    };
  }
}
