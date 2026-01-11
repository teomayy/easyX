import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService, Currency, Network } from '@easyx/database';
import { BitcoinRpcClient } from '../shared/rpc-client';

@Injectable()
export class BtcService implements OnModuleInit {
  private readonly logger = new Logger(BtcService.name);
  private rpcClient: BitcoinRpcClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    const host = this.configService.get<string>('blockchain.btc.host', 'localhost');
    const port = this.configService.get<number>('blockchain.btc.port', 18332);
    const username = this.configService.get<string>('blockchain.btc.username', 'easyx_btc');
    const password = this.configService.get<string>('blockchain.btc.password', 'btc_rpc_password_change_me');

    this.rpcClient = new BitcoinRpcClient(host, port, username, password);
    this.logger.log(`BTC RPC client initialized: ${host}:${port}`);
  }

  getRpcClient(): BitcoinRpcClient {
    return this.rpcClient;
  }

  async generateAddress(userId: string): Promise<string> {
    try {
      // Generate new address with user ID as label
      const address = await this.rpcClient.getNewAddress(userId);

      // Save to database
      await this.prisma.walletAddress.create({
        data: {
          userId,
          currency: Currency.BTC,
          network: Network.BTC,
          address,
        },
      });

      this.logger.log(`Generated BTC address for user ${userId}: ${address}`);
      return address;
    } catch (error) {
      this.logger.error(`Failed to generate BTC address: ${error}`);
      throw error;
    }
  }

  async getOrCreateAddress(userId: string): Promise<string> {
    // Check if user already has a BTC address
    const existingAddress = await this.prisma.walletAddress.findFirst({
      where: {
        userId,
        currency: Currency.BTC,
        network: Network.BTC,
      },
    });

    if (existingAddress) {
      return existingAddress.address;
    }

    return this.generateAddress(userId);
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      const result = await this.rpcClient.validateAddress(address);
      return result.isvalid;
    } catch {
      return false;
    }
  }

  async getTransaction(txid: string) {
    return this.rpcClient.getTransaction(txid);
  }

  async sendTransaction(
    toAddress: string,
    amount: number,
  ): Promise<string> {
    try {
      const txid = await this.rpcClient.sendToAddress(toAddress, amount);
      this.logger.log(`Sent ${amount} BTC to ${toAddress}, txid: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error(`Failed to send BTC: ${error}`);
      throw error;
    }
  }

  async estimateFee(confTarget = 6): Promise<number> {
    try {
      const result = await this.rpcClient.estimateSmartFee(confTarget);
      return result.feerate || 0.0001; // Default fee if estimation fails
    } catch {
      return 0.0001;
    }
  }

  async getBlockchainInfo() {
    return this.rpcClient.getBlockchainInfo();
  }

  async getNetworkInfo() {
    return this.rpcClient.getNetworkInfo();
  }
}
