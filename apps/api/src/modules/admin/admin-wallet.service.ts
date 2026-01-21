import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@easyx/database';
import { BtcService } from '../blockchain/btc/btc.service';
import { LtcService } from '../blockchain/ltc/ltc.service';
import { EthService } from '../blockchain/eth/eth.service';
import { TronService } from '../blockchain/tron/tron.service';

export interface WalletBalance {
  currency: string;
  network: string;
  balance: string;
  address?: string;
}

export interface NodeStatus {
  currency: string;
  network: string;
  status: 'online' | 'offline' | 'syncing';
  blockHeight?: number;
  syncProgress?: number;
  peers?: number;
  version?: string;
}

@Injectable()
export class AdminWalletService {
  private readonly logger = new Logger(AdminWalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly btcService: BtcService,
    private readonly ltcService: LtcService,
    private readonly ethService: EthService,
    private readonly tronService: TronService,
  ) {}

  async getWalletBalances(): Promise<WalletBalance[]> {
    const balances: WalletBalance[] = [];

    // BTC Balance
    try {
      const btcRpc = this.btcService.getRpcClient();
      const btcBalance = await btcRpc.getBalance();
      balances.push({
        currency: 'BTC',
        network: 'Bitcoin',
        balance: btcBalance.toString(),
      });
    } catch (error) {
      this.logger.error(`Failed to get BTC balance: ${error}`);
      balances.push({
        currency: 'BTC',
        network: 'Bitcoin',
        balance: 'N/A',
      });
    }

    // LTC Balance
    try {
      const ltcRpc = this.ltcService.getRpcClient();
      const ltcBalance = await ltcRpc.getBalance();
      balances.push({
        currency: 'LTC',
        network: 'Litecoin',
        balance: ltcBalance.toString(),
      });
    } catch (error) {
      this.logger.error(`Failed to get LTC balance: ${error}`);
      balances.push({
        currency: 'LTC',
        network: 'Litecoin',
        balance: 'N/A',
      });
    }

    // ETH Balance (master wallet)
    try {
      const ethMasterAddress = this.ethService.getMasterAddress();
      if (ethMasterAddress) {
        const ethBalance = await this.ethService.getEthBalance(ethMasterAddress);
        balances.push({
          currency: 'ETH',
          network: 'Ethereum',
          balance: ethBalance,
          address: ethMasterAddress,
        });

        // USDT ERC20 Balance
        const usdtErc20Balance = await this.ethService.getUsdtBalance(ethMasterAddress);
        balances.push({
          currency: 'USDT',
          network: 'ERC20',
          balance: usdtErc20Balance,
          address: ethMasterAddress,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to get ETH/ERC20 balance: ${error}`);
      balances.push({
        currency: 'ETH',
        network: 'Ethereum',
        balance: 'N/A',
      });
    }

    // TRX and USDT TRC20 Balance
    try {
      const tronMasterAddress = this.tronService.getMasterAddress();
      if (tronMasterAddress) {
        const trxBalance = await this.tronService.getTrxBalance(tronMasterAddress);
        balances.push({
          currency: 'TRX',
          network: 'Tron',
          balance: trxBalance,
          address: tronMasterAddress,
        });

        const usdtTrc20Balance = await this.tronService.getUsdtBalance(tronMasterAddress);
        balances.push({
          currency: 'USDT',
          network: 'TRC20',
          balance: usdtTrc20Balance,
          address: tronMasterAddress,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to get TRX/TRC20 balance: ${error}`);
      balances.push({
        currency: 'TRX',
        network: 'Tron',
        balance: 'N/A',
      });
    }

    return balances;
  }

  async getNodeStatuses(): Promise<NodeStatus[]> {
    const statuses: NodeStatus[] = [];

    // BTC Node Status
    try {
      const btcInfo = await this.btcService.getBlockchainInfo();
      const btcNetwork = await this.btcService.getNetworkInfo();
      statuses.push({
        currency: 'BTC',
        network: 'Bitcoin',
        status: btcInfo.initialblockdownload ? 'syncing' : 'online',
        blockHeight: btcInfo.blocks,
        syncProgress: btcInfo.verificationprogress * 100,
        peers: btcNetwork.connections,
        version: btcNetwork.subversion,
      });
    } catch (error) {
      this.logger.error(`Failed to get BTC node status: ${error}`);
      statuses.push({
        currency: 'BTC',
        network: 'Bitcoin',
        status: 'offline',
      });
    }

    // LTC Node Status
    try {
      const ltcInfo = await this.ltcService.getBlockchainInfo();
      const ltcNetwork = await this.ltcService.getNetworkInfo();
      statuses.push({
        currency: 'LTC',
        network: 'Litecoin',
        status: ltcInfo.initialblockdownload ? 'syncing' : 'online',
        blockHeight: ltcInfo.blocks,
        syncProgress: ltcInfo.verificationprogress * 100,
        peers: ltcNetwork.connections,
        version: ltcNetwork.subversion,
      });
    } catch (error) {
      this.logger.error(`Failed to get LTC node status: ${error}`);
      statuses.push({
        currency: 'LTC',
        network: 'Litecoin',
        status: 'offline',
      });
    }

    // ETH Node Status
    try {
      const ethBlock = await this.ethService.getBlockNumber();
      statuses.push({
        currency: 'ETH',
        network: 'Ethereum',
        status: 'online',
        blockHeight: ethBlock,
      });
    } catch (error) {
      this.logger.error(`Failed to get ETH node status: ${error}`);
      statuses.push({
        currency: 'ETH',
        network: 'Ethereum',
        status: 'offline',
      });
    }

    // TRON Node Status
    try {
      const tronBlock = await this.tronService.getNowBlock();
      statuses.push({
        currency: 'TRX',
        network: 'Tron',
        status: tronBlock ? 'online' : 'offline',
        blockHeight: tronBlock?.block_header?.raw_data?.number,
      });
    } catch (error) {
      this.logger.error(`Failed to get TRON node status: ${error}`);
      statuses.push({
        currency: 'TRX',
        network: 'Tron',
        status: 'offline',
      });
    }

    return statuses;
  }

  async getWalletAddresses(params: {
    currency?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { currency, userId, limit = 50, offset = 0 } = params;

    try {
      const where: Record<string, unknown> = {};
      if (currency) where.currency = currency;
      if (userId) where.userId = userId;

      const [addresses, total] = await Promise.all([
        this.prisma.walletAddress.findMany({
          where,
          include: {
            user: {
              select: { id: true, phone: true, username: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.walletAddress.count({ where }),
      ]);

      return { addresses, total, limit, offset };
    } catch (error) {
      this.logger.error(`Failed to get wallet addresses: ${error}`);
      return { addresses: [], total: 0, limit, offset };
    }
  }

  async getAddressStats() {
    try {
      const stats = await this.prisma.walletAddress.groupBy({
        by: ['currency', 'network'],
        _count: { id: true },
      });

      return stats.map((s) => ({
        currency: s.currency,
        network: s.network,
        count: s._count.id,
      }));
    } catch (error) {
      this.logger.error(`Failed to get address stats: ${error}`);
      return [];
    }
  }

  async sendCrypto(params: {
    currency: string;
    network: string;
    toAddress: string;
    amount: string;
  }): Promise<{ txHash: string }> {
    const { currency, network, toAddress, amount } = params;

    this.logger.log(`Sending ${amount} ${currency} (${network}) to ${toAddress}`);

    let txHash: string;

    switch (currency.toUpperCase()) {
      case 'BTC':
        txHash = await this.btcService.sendTransaction(toAddress, parseFloat(amount));
        break;
      case 'LTC':
        txHash = await this.ltcService.sendTransaction(toAddress, parseFloat(amount));
        break;
      default:
        throw new Error(`Sending ${currency} on ${network} is not yet implemented`);
    }

    this.logger.log(`Sent ${amount} ${currency} to ${toAddress}, txHash: ${txHash}`);
    return { txHash };
  }
}
