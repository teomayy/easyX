import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService, Currency } from '@easyx/database';
import { Decimal } from '@easyx/database';
import { LedgerService } from '../ledger/ledger.service';
import { BalanceService } from '../ledger/balance.service';
import { UserService } from '../user/user.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { GetTransfersDto } from './dto/get-transfers.dto';

@Injectable()
export class P2pService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
    private readonly balanceService: BalanceService,
    private readonly userService: UserService,
  ) {}

  async createTransfer(fromUserId: string, dto: CreateTransferDto) {
    const { recipient, currency, amount: amountStr, note } = dto;
    const amount = new Decimal(amountStr);

    if (amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException('Amount must be positive');
    }

    // Find recipient user
    const toUser = await this.findRecipient(recipient);
    if (!toUser) {
      throw new NotFoundException('Recipient not found');
    }

    if (toUser.id === fromUserId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    // Check balance
    const hasBalance = await this.balanceService.hasBalance(fromUserId, currency, amount);
    if (!hasBalance) {
      throw new BadRequestException('Insufficient balance');
    }

    // Create transfer in transaction
    return this.prisma.$transaction(async (tx) => {
      // Create transfer record
      const transfer = await tx.p2pTransfer.create({
        data: {
          fromUserId,
          toUserId: toUser.id,
          currency,
          amount,
          note,
        },
      });

      // Execute ledger transfer
      await this.ledgerService.transfer({
        fromUserId,
        toUserId: toUser.id,
        currency,
        amount,
        operation: 'p2p',
        referenceId: transfer.id,
      });

      return {
        id: transfer.id,
        toUser: {
          id: toUser.id,
          username: toUser.username,
        },
        currency,
        amount: amount.toString(),
        note,
        createdAt: transfer.createdAt,
      };
    });
  }

  async getUserTransfers(userId: string, query: GetTransfersDto) {
    const { currency, direction, limit = 50, offset = 0 } = query;

    let where: Record<string, unknown>;
    if (direction === 'sent') {
      where = { fromUserId: userId };
    } else if (direction === 'received') {
      where = { toUserId: userId };
    } else {
      where = {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      };
    }

    if (currency) {
      where.currency = currency;
    }

    const [transfers, total] = await Promise.all([
      this.prisma.p2pTransfer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          fromUser: { select: { id: true, username: true } },
          toUser: { select: { id: true, username: true } },
        },
      }),
      this.prisma.p2pTransfer.count({ where }),
    ]);

    return {
      transfers: transfers.map((t) => ({
        ...t,
        direction: t.fromUserId === userId ? 'sent' : 'received',
      })),
      total,
      limit,
      offset,
    };
  }

  private async findRecipient(recipient: string) {
    // Try to find by username first
    let user = await this.userService.findByUsername(recipient);
    if (user) return user;

    // Try by phone
    if (recipient.startsWith('+')) {
      user = await this.userService.findByPhone(recipient);
      if (user) return user;
    }

    // Try by user ID
    user = await this.userService.findById(recipient);
    return user;
  }
}
