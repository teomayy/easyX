import { Injectable } from '@nestjs/common';
import { PrismaService, Currency, Network, DepositStatus } from '@easyx/database';
import { Decimal } from '@easyx/database';
import { LedgerService } from '../ledger/ledger.service';
import { WalletService } from '../wallet/wallet.service';
import { GetDepositsDto } from './dto/get-deposits.dto';

interface ProcessDepositParams {
  txHash: string;
  address: string;
  amount: Decimal;
  network: Network;
  currency: Currency;
}

@Injectable()
export class DepositService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
    private readonly walletService: WalletService,
  ) {}

  async processDeposit(params: ProcessDepositParams) {
    const { txHash, address, amount, network, currency } = params;

    // Check if already processed (idempotency)
    const existing = await this.prisma.deposit.findUnique({
      where: { txHash },
    });

    if (existing) {
      return existing;
    }

    // Find user by address
    const wallet = await this.walletService.findByAddress(address);
    if (!wallet) {
      throw new Error(`Unknown address: ${address}`);
    }

    // Create deposit record
    const deposit = await this.prisma.deposit.create({
      data: {
        userId: wallet.userId,
        currency,
        network,
        txHash,
        amount,
        status: DepositStatus.PENDING,
        confirmations: 0,
      },
    });

    return deposit;
  }

  async confirmDeposit(depositId: string, confirmations: number) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit) {
      throw new Error(`Deposit not found: ${depositId}`);
    }

    if (deposit.status === DepositStatus.CONFIRMED) {
      return deposit;
    }

    // Update confirmations
    const updated = await this.prisma.deposit.update({
      where: { id: depositId },
      data: { confirmations },
    });

    // Check if enough confirmations
    const requiredConfirmations = this.getRequiredConfirmations(deposit.network);
    if (confirmations >= requiredConfirmations && deposit.status === DepositStatus.PENDING) {
      await this.creditDeposit(deposit);
    }

    return updated;
  }

  private async creditDeposit(deposit: { id: string; userId: string; currency: Currency; amount: Decimal }) {
    await this.prisma.$transaction(async (tx) => {
      // Credit user balance
      await this.ledgerService.credit({
        userId: deposit.userId,
        currency: deposit.currency,
        amount: deposit.amount,
        operation: 'deposit',
        referenceId: deposit.id,
      });

      // Update deposit status
      await tx.deposit.update({
        where: { id: deposit.id },
        data: { status: DepositStatus.CONFIRMED },
      });
    });
  }

  async getUserDeposits(userId: string, query: GetDepositsDto) {
    const { currency, status, limit = 50, offset = 0 } = query;

    const where: Record<string, unknown> = { userId };
    if (currency) where.currency = currency;
    if (status) where.status = status;

    const [deposits, total] = await Promise.all([
      this.prisma.deposit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.deposit.count({ where }),
    ]);

    return { deposits, total, limit, offset };
  }

  private getRequiredConfirmations(network: Network): number {
    const confirmations: Record<Network, number> = {
      [Network.BTC]: 3,
      [Network.LTC]: 6,
      [Network.TRC20]: 20,
      [Network.ERC20]: 12,
    };
    return confirmations[network] ?? 6;
  }
}
