import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService, Currency, Network, DepositStatus } from '@easyx/database';
import { TronService } from './tron.service';
import { LedgerService } from '../../ledger/ledger.service';
import { Decimal } from '@prisma/client/runtime/library';

const REQUIRED_CONFIRMATIONS = 20; // TRON needs more confirmations
const POLL_INTERVAL_MS = 10000; // 10 seconds (TRON block time ~3s)

@Injectable()
export class TronWatcherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TronWatcherService.name);
  private pollInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private processedTxIds = new Set<string>();

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly tronService: TronService,
    private readonly ledgerService: LedgerService,
  ) {}

  onModuleInit() {
    const enabled = this.configService.get<boolean>('blockchain.tron.watcherEnabled', false);

    if (enabled) {
      this.startWatching();
      this.logger.log('TRON TRC20 Watcher started');
    } else {
      this.logger.log('TRON TRC20 Watcher disabled');
    }
  }

  onModuleDestroy() {
    this.stopWatching();
  }

  private startWatching() {
    this.pollInterval = setInterval(() => {
      this.processTransfers().catch((error) => {
        this.logger.error(`Error processing TRC20 transfers: ${error}`);
      });
    }, POLL_INTERVAL_MS);

    this.processTransfers().catch((error) => {
      this.logger.error(`Error in initial TRC20 transfer processing: ${error}`);
    });
  }

  private stopWatching() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private async processTransfers() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Get all watched TRC20 addresses
      const watchedAddresses = await this.prisma.walletAddress.findMany({
        where: { currency: Currency.USDT_TRC20, network: Network.TRC20 },
        select: { address: true, userId: true },
      });

      if (watchedAddresses.length === 0) return;

      const addressMap = new Map(watchedAddresses.map((wa) => [wa.address, wa.userId]));

      // Check each address for new transfers
      for (const [address, userId] of addressMap) {
        await this.checkAddressTransfers(address, userId);
      }

      // Update pending deposits
      await this.updatePendingDeposits();
    } catch (error) {
      this.logger.error(`Failed to process TRC20 transfers: ${error}`);
    } finally {
      this.isProcessing = false;
    }
  }

  private async checkAddressTransfers(address: string, userId: string) {
    try {
      const transfers = await this.tronService.getTrc20Transfers(address);

      for (const transfer of transfers) {
        if (this.processedTxIds.has(transfer.txID)) continue;

        await this.processTransfer(transfer, userId);
        this.processedTxIds.add(transfer.txID);

        // Keep the set from growing too large
        if (this.processedTxIds.size > 10000) {
          const iterator = this.processedTxIds.values();
          for (let i = 0; i < 5000; i++) {
            this.processedTxIds.delete(iterator.next().value);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to check transfers for ${address}: ${error}`);
    }
  }

  private async processTransfer(
    transfer: {
      txID: string;
      value: string;
      block_timestamp: number;
      token_info?: { decimals: number };
    },
    userId: string,
  ) {
    try {
      const existingDeposit = await this.prisma.deposit.findUnique({
        where: { txHash: transfer.txID },
      });

      if (existingDeposit) return;

      // Calculate amount (USDT TRC20 has 6 decimals)
      const decimals = transfer.token_info?.decimals || 6;
      const amount = (Number(transfer.value) / Math.pow(10, decimals)).toString();

      // Get confirmations
      const txInfo = await this.tronService.getTransactionInfo(transfer.txID);
      const confirmations = txInfo?.blockNumber
        ? await this.getConfirmations(txInfo.blockNumber)
        : 0;

      const deposit = await this.prisma.deposit.create({
        data: {
          userId,
          currency: Currency.USDT_TRC20,
          network: Network.TRC20,
          txHash: transfer.txID,
          amount: new Decimal(amount),
          confirmations,
          status:
            confirmations >= REQUIRED_CONFIRMATIONS
              ? DepositStatus.CONFIRMED
              : DepositStatus.PENDING,
        },
      });

      this.logger.log(`New USDT TRC20 deposit: ${amount} USDT, tx: ${transfer.txID}`);

      if (confirmations >= REQUIRED_CONFIRMATIONS) {
        await this.confirmDeposit(deposit.id);
      }
    } catch (error) {
      this.logger.error(`Failed to process TRC20 transfer ${transfer.txID}: ${error}`);
    }
  }

  private async getConfirmations(blockNumber: number): Promise<number> {
    try {
      const currentBlock = await this.tronService.getNowBlock();
      if (currentBlock?.block_header?.raw_data?.number) {
        return currentBlock.block_header.raw_data.number - blockNumber;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  private async confirmDeposit(depositId: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit || deposit.status === DepositStatus.CONFIRMED) return;

    await this.ledgerService.credit({
      userId: deposit.userId,
      currency: Currency.USDT_TRC20,
      amount: deposit.amount,
      operation: 'deposit',
      referenceId: deposit.id,
    });

    await this.prisma.deposit.update({
      where: { id: depositId },
      data: { status: DepositStatus.CONFIRMED },
    });

    this.logger.log(`USDT TRC20 deposit confirmed: ${deposit.amount} USDT`);
  }

  private async updatePendingDeposits() {
    const pendingDeposits = await this.prisma.deposit.findMany({
      where: { currency: Currency.USDT_TRC20, status: DepositStatus.PENDING },
    });

    for (const deposit of pendingDeposits) {
      try {
        const txInfo = await this.tronService.getTransactionInfo(deposit.txHash);

        if (txInfo?.blockNumber) {
          const confirmations = await this.getConfirmations(txInfo.blockNumber);

          if (confirmations !== deposit.confirmations) {
            await this.prisma.deposit.update({
              where: { id: deposit.id },
              data: { confirmations },
            });

            if (confirmations >= REQUIRED_CONFIRMATIONS) {
              await this.confirmDeposit(deposit.id);
            }
          }
        }
      } catch (error) {
        this.logger.error(`Failed to update TRC20 deposit ${deposit.id}: ${error}`);
      }
    }
  }
}
