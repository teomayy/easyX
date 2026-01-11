import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, WithdrawalStatus, KycStatus } from '@easyx/database';
import { WithdrawalService } from '../withdrawal/withdrawal.service';
import { GetUsersDto } from './dto/get-users.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly withdrawalService: WithdrawalService,
  ) {}

  async getDashboardStats() {
    const [userCount, depositStats, withdrawalStats, tradeStats] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.deposit.aggregate({
        _count: true,
        _sum: { amount: true },
      }),
      this.prisma.withdrawal.aggregate({
        _count: true,
        _sum: { amount: true },
      }),
      this.prisma.trade.aggregate({
        _count: true,
      }),
    ]);

    const pendingWithdrawals = await this.prisma.withdrawal.count({
      where: { status: WithdrawalStatus.PENDING },
    });

    return {
      users: {
        total: userCount,
      },
      deposits: {
        count: depositStats._count,
        totalAmount: depositStats._sum.amount?.toString() ?? '0',
      },
      withdrawals: {
        count: withdrawalStats._count,
        totalAmount: withdrawalStats._sum.amount?.toString() ?? '0',
        pending: pendingWithdrawals,
      },
      trades: {
        count: tradeStats._count,
      },
    };
  }

  async getUsers(query: GetUsersDto) {
    const { search, kycStatus, limit = 50, offset = 0 } = query;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { phone: { contains: search } },
        { username: { contains: search } },
        { telegramId: { contains: search } },
      ];
    }
    if (kycStatus) {
      where.kycStatus = kycStatus;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          phone: true,
          username: true,
          telegramId: true,
          kycStatus: true,
          createdAt: true,
          _count: {
            select: { balances: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, limit, offset };
  }

  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        balances: true,
        deposits: { orderBy: { createdAt: 'desc' }, take: 10 },
        withdrawals: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getPendingWithdrawals() {
    return this.prisma.withdrawal.findMany({
      where: { status: WithdrawalStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, phone: true, username: true, kycStatus: true },
        },
      },
    });
  }

  async approveWithdrawal(withdrawalId: string) {
    return this.withdrawalService.processWithdrawal(withdrawalId);
  }

  async rejectWithdrawal(withdrawalId: string, reason: string) {
    return this.withdrawalService.rejectWithdrawal(withdrawalId, reason);
  }

  async getLedgerEntries(query: { limit?: number; offset?: number }) {
    const { limit = 100, offset = 0 } = query;

    const [entries, total] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: { select: { id: true, username: true, phone: true } },
        },
      }),
      this.prisma.ledgerEntry.count(),
    ]);

    return { entries, total, limit, offset };
  }

  async updateUserKyc(userId: string, status: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: status as KycStatus },
    });
  }
}
