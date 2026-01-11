import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService, Currency, Network, DepositStatus } from '@easyx/database';
import { EthService } from './eth.service';
import { LedgerService } from '../../ledger/ledger.service';
import { Decimal } from '@prisma/client/runtime/library';
import { formatUnits, Interface } from 'ethers';

const REQUIRED_CONFIRMATIONS = 12;
const POLL_INTERVAL_MS = 15000; // 15 seconds (ETH block time ~12s)

const ERC20_TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

@Injectable()
export class EthWatcherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EthWatcherService.name);
  private pollInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private lastProcessedBlock = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly ethService: EthService,
    private readonly ledgerService: LedgerService,
  ) {}

  async onModuleInit() {
    const enabled = this.configService.get<boolean>('blockchain.eth.watcherEnabled', false);

    if (enabled) {
      // Get starting block
      this.lastProcessedBlock = await this.ethService.getBlockNumber() - 100;
      this.startWatching();
      this.logger.log('ETH/ERC20 Watcher started');
    } else {
      this.logger.log('ETH/ERC20 Watcher disabled');
    }
  }

  onModuleDestroy() {
    this.stopWatching();
  }

  private startWatching() {
    this.pollInterval = setInterval(() => {
      this.processBlocks().catch((error) => {
        this.logger.error(`Error processing ETH blocks: ${error}`);
      });
    }, POLL_INTERVAL_MS);

    this.processBlocks().catch((error) => {
      this.logger.error(`Error in initial ETH block processing: ${error}`);
    });
  }

  private stopWatching() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private async processBlocks() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const currentBlock = await this.ethService.getBlockNumber();
      const confirmedBlock = currentBlock - REQUIRED_CONFIRMATIONS;

      if (this.lastProcessedBlock >= confirmedBlock) {
        return;
      }

      // Get all watched addresses
      const watchedAddresses = await this.prisma.walletAddress.findMany({
        where: { currency: Currency.USDT_ERC20, network: Network.ERC20 },
        select: { address: true, userId: true },
      });

      if (watchedAddresses.length === 0) return;

      const addressMap = new Map(
        watchedAddresses.map((wa) => [wa.address.toLowerCase(), wa.userId]),
      );

      // Process blocks in batches
      const batchSize = 100;
      for (
        let fromBlock = this.lastProcessedBlock + 1;
        fromBlock <= confirmedBlock;
        fromBlock += batchSize
      ) {
        const toBlock = Math.min(fromBlock + batchSize - 1, confirmedBlock);

        await this.processBlockRange(fromBlock, toBlock, addressMap);
        this.lastProcessedBlock = toBlock;
      }

      // Update pending deposits
      await this.updatePendingDeposits(currentBlock);
    } catch (error) {
      this.logger.error(`Failed to process ETH blocks: ${error}`);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processBlockRange(
    fromBlock: number,
    toBlock: number,
    addressMap: Map<string, string>,
  ) {
    try {
      const provider = this.ethService.getProvider();
      const usdtContract = this.ethService.getUsdtContract();
      const contractAddress = await usdtContract.getAddress();

      // Get Transfer events from USDT contract
      const logs = await provider.getLogs({
        address: contractAddress,
        topics: [ERC20_TRANSFER_TOPIC],
        fromBlock,
        toBlock,
      });

      const iface = new Interface([
        'event Transfer(address indexed from, address indexed to, uint256 value)',
      ]);

      for (const log of logs) {
        try {
          const parsed = iface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });

          if (!parsed) continue;

          const toAddress = parsed.args[1].toLowerCase();
          const userId = addressMap.get(toAddress);

          if (userId) {
            const amount = formatUnits(parsed.args[2], 6); // USDT has 6 decimals
            await this.processDeposit(log.transactionHash, userId, amount, log.blockNumber);
          }
        } catch (error) {
          this.logger.error(`Failed to parse log: ${error}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to process block range ${fromBlock}-${toBlock}: ${error}`);
    }
  }

  private async processDeposit(
    txHash: string,
    userId: string,
    amount: string,
    blockNumber: number,
  ) {
    try {
      const existingDeposit = await this.prisma.deposit.findUnique({
        where: { txHash },
      });

      if (existingDeposit) return;

      const currentBlock = await this.ethService.getBlockNumber();
      const confirmations = currentBlock - blockNumber;

      const deposit = await this.prisma.deposit.create({
        data: {
          userId,
          currency: Currency.USDT_ERC20,
          network: Network.ERC20,
          txHash,
          amount: new Decimal(amount),
          confirmations,
          status:
            confirmations >= REQUIRED_CONFIRMATIONS
              ? DepositStatus.CONFIRMED
              : DepositStatus.PENDING,
        },
      });

      this.logger.log(`New USDT ERC20 deposit: ${amount} USDT, tx: ${txHash}`);

      if (confirmations >= REQUIRED_CONFIRMATIONS) {
        await this.confirmDeposit(deposit.id);
      }
    } catch (error) {
      this.logger.error(`Failed to process ERC20 deposit ${txHash}: ${error}`);
    }
  }

  private async confirmDeposit(depositId: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit || deposit.status === DepositStatus.CONFIRMED) return;

    await this.ledgerService.credit({
      userId: deposit.userId,
      currency: Currency.USDT_ERC20,
      amount: deposit.amount,
      operation: 'deposit',
      referenceId: deposit.id,
    });

    await this.prisma.deposit.update({
      where: { id: depositId },
      data: { status: DepositStatus.CONFIRMED },
    });

    this.logger.log(`USDT ERC20 deposit confirmed: ${deposit.amount} USDT`);
  }

  private async updatePendingDeposits(currentBlock: number) {
    const pendingDeposits = await this.prisma.deposit.findMany({
      where: { currency: Currency.USDT_ERC20, status: DepositStatus.PENDING },
    });

    for (const deposit of pendingDeposits) {
      try {
        const receipt = await this.ethService.getTransactionReceipt(deposit.txHash);

        if (receipt && receipt.blockNumber) {
          const confirmations = currentBlock - receipt.blockNumber;

          await this.prisma.deposit.update({
            where: { id: deposit.id },
            data: { confirmations },
          });

          if (confirmations >= REQUIRED_CONFIRMATIONS) {
            await this.confirmDeposit(deposit.id);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to update ERC20 deposit ${deposit.id}: ${error}`);
      }
    }
  }
}
