import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService, Currency, Network, DepositStatus } from '@easyx/database';
import { LtcService } from './ltc.service';
import { LedgerService } from '../../ledger/ledger.service';
import { Decimal } from '@prisma/client/runtime/library';

const REQUIRED_CONFIRMATIONS = 6;
const POLL_INTERVAL_MS = 30000;

@Injectable()
export class LtcWatcherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LtcWatcherService.name);
  private pollInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly ltcService: LtcService,
    private readonly ledgerService: LedgerService,
  ) {}

  onModuleInit() {
    const enabled = this.configService.get<boolean>('blockchain.ltc.watcherEnabled', false);

    if (enabled) {
      this.startWatching();
      this.logger.log('LTC Watcher started');
    } else {
      this.logger.log('LTC Watcher disabled');
    }
  }

  onModuleDestroy() {
    this.stopWatching();
  }

  private startWatching() {
    this.pollInterval = setInterval(() => {
      this.processTransactions().catch((error) => {
        this.logger.error(`Error processing LTC transactions: ${error}`);
      });
    }, POLL_INTERVAL_MS);

    this.processTransactions().catch((error) => {
      this.logger.error(`Error in initial LTC transaction processing: ${error}`);
    });
  }

  private stopWatching() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private async processTransactions() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const watchedAddresses = await this.prisma.walletAddress.findMany({
        where: { currency: Currency.LTC, network: Network.LTC },
        select: { address: true, userId: true },
      });

      if (watchedAddresses.length === 0) return;

      const addressMap = new Map(watchedAddresses.map((wa) => [wa.address, wa.userId]));
      const rpcClient = this.ltcService.getRpcClient();
      const transactions = await rpcClient.listTransactions('*', 100);

      const incomingTxs = transactions.filter(
        (tx) => tx.category === 'receive' && addressMap.has(tx.address),
      );

      for (const tx of incomingTxs) {
        await this.processTransaction(tx, addressMap.get(tx.address)!);
      }

      await this.updatePendingDeposits();
    } catch (error) {
      this.logger.error(`Failed to process LTC transactions: ${error}`);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processTransaction(
    tx: { txid: string; address: string; amount: number; confirmations: number },
    userId: string,
  ) {
    try {
      const existingDeposit = await this.prisma.deposit.findUnique({
        where: { txHash: tx.txid },
      });

      if (existingDeposit) {
        if (existingDeposit.confirmations !== tx.confirmations) {
          await this.prisma.deposit.update({
            where: { id: existingDeposit.id },
            data: { confirmations: tx.confirmations },
          });

          if (
            existingDeposit.status === DepositStatus.PENDING &&
            tx.confirmations >= REQUIRED_CONFIRMATIONS
          ) {
            await this.confirmDeposit(existingDeposit.id);
          }
        }
        return;
      }

      const deposit = await this.prisma.deposit.create({
        data: {
          userId,
          currency: Currency.LTC,
          network: Network.LTC,
          txHash: tx.txid,
          amount: new Decimal(tx.amount),
          confirmations: tx.confirmations,
          status:
            tx.confirmations >= REQUIRED_CONFIRMATIONS
              ? DepositStatus.CONFIRMED
              : DepositStatus.PENDING,
        },
      });

      this.logger.log(`New LTC deposit: ${tx.amount} LTC, txid: ${tx.txid}`);

      if (tx.confirmations >= REQUIRED_CONFIRMATIONS) {
        await this.confirmDeposit(deposit.id);
      }
    } catch (error) {
      this.logger.error(`Failed to process LTC tx ${tx.txid}: ${error}`);
    }
  }

  private async confirmDeposit(depositId: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit || deposit.status === DepositStatus.CONFIRMED) return;

    await this.ledgerService.credit({
      userId: deposit.userId,
      currency: Currency.LTC,
      amount: deposit.amount,
      operation: 'deposit',
      referenceId: deposit.id,
    });

    await this.prisma.deposit.update({
      where: { id: depositId },
      data: { status: DepositStatus.CONFIRMED },
    });

    this.logger.log(`LTC deposit confirmed: ${deposit.amount} LTC`);
  }

  private async updatePendingDeposits() {
    const pendingDeposits = await this.prisma.deposit.findMany({
      where: { currency: Currency.LTC, status: DepositStatus.PENDING },
    });

    const rpcClient = this.ltcService.getRpcClient();

    for (const deposit of pendingDeposits) {
      try {
        const tx = await rpcClient.getTransaction(deposit.txHash);

        if (tx.confirmations !== deposit.confirmations) {
          await this.prisma.deposit.update({
            where: { id: deposit.id },
            data: { confirmations: tx.confirmations },
          });

          if (tx.confirmations >= REQUIRED_CONFIRMATIONS) {
            await this.confirmDeposit(deposit.id);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to update LTC deposit ${deposit.id}: ${error}`);
      }
    }
  }
}
