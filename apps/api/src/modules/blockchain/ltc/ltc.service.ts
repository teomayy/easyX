import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService, Currency, Network } from '@easyx/database';
import { BitcoinRpcClient } from '../shared/rpc-client';

@Injectable()
export class LtcService implements OnModuleInit {
  private readonly logger = new Logger(LtcService.name);
  private rpcClient: BitcoinRpcClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    const host = this.configService.get<string>('blockchain.ltc.host', 'localhost');
    const port = this.configService.get<number>('blockchain.ltc.port', 19332);
    const username = this.configService.get<string>('blockchain.ltc.username', 'easyx_ltc');
    const password = this.configService.get<string>('blockchain.ltc.password', 'ltc_rpc_password_change_me');

    this.rpcClient = new BitcoinRpcClient(host, port, username, password);
    this.logger.log(`LTC RPC client initialized: ${host}:${port}`);
  }

  getRpcClient(): BitcoinRpcClient {
    return this.rpcClient;
  }

  async generateAddress(userId: string): Promise<string> {
    try {
      const address = await this.rpcClient.getNewAddress(userId);

      await this.prisma.walletAddress.create({
        data: {
          userId,
          currency: Currency.LTC,
          network: Network.LTC,
          address,
        },
      });

      this.logger.log(`Generated LTC address for user ${userId}: ${address}`);
      return address;
    } catch (error) {
      this.logger.error(`Failed to generate LTC address: ${error}`);
      throw error;
    }
  }

  async getOrCreateAddress(userId: string): Promise<string> {
    const existingAddress = await this.prisma.walletAddress.findFirst({
      where: {
        userId,
        currency: Currency.LTC,
        network: Network.LTC,
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

  async sendTransaction(toAddress: string, amount: number): Promise<string> {
    try {
      const txid = await this.rpcClient.sendToAddress(toAddress, amount);
      this.logger.log(`Sent ${amount} LTC to ${toAddress}, txid: ${txid}`);
      return txid;
    } catch (error) {
      this.logger.error(`Failed to send LTC: ${error}`);
      throw error;
    }
  }

  async estimateFee(confTarget = 6): Promise<number> {
    try {
      const result = await this.rpcClient.estimateSmartFee(confTarget);
      return result.feerate || 0.001;
    } catch {
      return 0.001;
    }
  }

  async getBlockchainInfo() {
    return this.rpcClient.getBlockchainInfo();
  }

  async getNetworkInfo() {
    return this.rpcClient.getNetworkInfo();
  }
}
