import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService, Currency, Network, DepositStatus } from '@easyx/database';
import { BtcService } from './btc.service';
import { LedgerService } from '../../ledger/ledger.service';
import { Decimal } from '@prisma/client/runtime/library';

const REQUIRED_CONFIRMATIONS = 3;
const POLL_INTERVAL_MS = 30000; // 30 seconds

@Injectable()
export class BtcWatcherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BtcWatcherService.name);
  private pollInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private lastBlockHeight = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly btcService: BtcService,
    private readonly ledgerService: LedgerService,
  ) {}

  onModuleInit() {
    const enabled = this.configService.get<boolean>('blockchain.btc.watcherEnabled', false);

    if (enabled) {
      this.startWatching();
      this.logger.log('BTC Watcher started');
    } else {
      this.logger.log('BTC Watcher disabled');
    }
  }

  onModuleDestroy() {
    this.stopWatching();
  }

  private startWatching() {
    this.pollInterval = setInterval(() => {
      this.processTransactions().catch((error) => {
        this.logger.error(`Error processing BTC transactions: ${error}`);
      });
    }, POLL_INTERVAL_MS);

    // Initial run
    this.processTransactions().catch((error) => {
      this.logger.error(`Error in initial BTC transaction processing: ${error}`);
    });
  }

  private stopWatching() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.logger.log('BTC Watcher stopped');
  }

  private async processTransactions() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // Get all our watched addresses
      const watchedAddresses = await this.prisma.walletAddress.findMany({
        where: {
          currency: Currency.BTC,
          network: Network.BTC,
        },
        select: {
          address: true,
          userId: true,
        },
      });

      if (watchedAddresses.length === 0) {
        return;
      }

      const addressMap = new Map(
        watchedAddresses.map((wa) => [wa.address, wa.userId]),
      );

      // Get recent transactions from node
      const rpcClient = this.btcService.getRpcClient();
      const transactions = await rpcClient.listTransactions('*', 100);

      // Filter incoming transactions to our addresses
      const incomingTxs = transactions.filter(
        (tx) =>
          tx.category === 'receive' &&
          addressMap.has(tx.address) &&
          tx.confirmations >= 0,
      );

      for (const tx of incomingTxs) {
        await this.processTransaction(tx, addressMap.get(tx.address)!);
      }

      // Update pending deposits confirmations
      await this.updatePendingDeposits();
    } catch (error) {
      this.logger.error(`Failed to process BTC transactions: ${error}`);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processTransaction(
    tx: {
      txid: string;
      address: string;
      amount: number;
      confirmations: number;
    },
    userId: string,
  ) {
    try {
      // Check if deposit already exists
      const existingDeposit = await this.prisma.deposit.findUnique({
        where: { txHash: tx.txid },
      });

      if (existingDeposit) {
        // Update confirmations if needed
        if (existingDeposit.confirmations !== tx.confirmations) {
          await this.prisma.deposit.update({
            where: { id: existingDeposit.id },
            data: { confirmations: tx.confirmations },
          });

          // Check if now confirmed
          if (
            existingDeposit.status === DepositStatus.PENDING &&
            tx.confirmations >= REQUIRED_CONFIRMATIONS
          ) {
            await this.confirmDeposit(existingDeposit.id);
          }
        }
        return;
      }

      // Create new deposit
      const deposit = await this.prisma.deposit.create({
        data: {
          userId,
          currency: Currency.BTC,
          network: Network.BTC,
          txHash: tx.txid,
          amount: new Decimal(tx.amount),
          confirmations: tx.confirmations,
          status:
            tx.confirmations >= REQUIRED_CONFIRMATIONS
              ? DepositStatus.CONFIRMED
              : DepositStatus.PENDING,
        },
      });

      this.logger.log(
        `New BTC deposit detected: ${tx.amount} BTC, txid: ${tx.txid}, confirmations: ${tx.confirmations}`,
      );

      // If already confirmed, credit balance
      if (tx.confirmations >= REQUIRED_CONFIRMATIONS) {
        await this.confirmDeposit(deposit.id);
      }
    } catch (error) {
      this.logger.error(`Failed to process transaction ${tx.txid}: ${error}`);
    }
  }

  private async confirmDeposit(depositId: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit || deposit.status === DepositStatus.CONFIRMED) {
      return;
    }

    // Credit user balance
    await this.ledgerService.credit({
      userId: deposit.userId,
      currency: Currency.BTC,
      amount: deposit.amount,
      operation: 'deposit',
      referenceId: deposit.id,
    });

    // Update deposit status
    await this.prisma.deposit.update({
      where: { id: depositId },
      data: { status: DepositStatus.CONFIRMED },
    });

    this.logger.log(
      `BTC deposit confirmed: ${deposit.amount} BTC, user: ${deposit.userId}`,
    );
  }

  private async updatePendingDeposits() {
    const pendingDeposits = await this.prisma.deposit.findMany({
      where: {
        currency: Currency.BTC,
        status: DepositStatus.PENDING,
      },
    });

    const rpcClient = this.btcService.getRpcClient();

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
        this.logger.error(
          `Failed to update deposit ${deposit.id}: ${error}`,
        );
      }
    }
  }
}
