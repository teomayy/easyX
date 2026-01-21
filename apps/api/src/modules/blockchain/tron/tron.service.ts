import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService, Currency, Network } from '@easyx/database';
import axios, { AxiosInstance } from 'axios';
import { TronWeb } from 'tronweb';

// USDT TRC20 Contract Address (Mainnet)
const USDT_TRC20_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

// TRC20 ABI for USDT (reserved for future use)
const _TRC20_ABI = {
  transfer: {
    type: 'Function',
    name: 'transfer',
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
  },
  balanceOf: {
    type: 'Function',
    name: 'balanceOf',
    inputs: [{ name: '_owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
};

interface TronTransaction {
  txID: string;
  blockNumber: number;
  block_timestamp: number;
  from: string;
  to: string;
  value: string;
  token_info?: {
    symbol: string;
    address: string;
    decimals: number;
  };
}

@Injectable()
export class TronService implements OnModuleInit {
  private readonly logger = new Logger(TronService.name);
  private httpClient: AxiosInstance;
  private tronWeb: TronWeb;
  private apiKey: string;
  private contractAddress: string;
  private masterAddress: string;
  private privateKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    const fullNodeUrl = this.configService.get<string>(
      'blockchain.tron.fullNodeUrl',
      'https://api.trongrid.io',
    );
    this.apiKey = this.configService.get<string>('blockchain.tron.apiKey', '');
    this.contractAddress = this.configService.get<string>(
      'blockchain.tron.usdtContract',
      USDT_TRC20_CONTRACT,
    );
    this.masterAddress = this.configService.get<string>('blockchain.tron.masterAddress', '');
    this.privateKey = this.configService.get<string>('blockchain.tron.privateKey', '');

    this.httpClient = axios.create({
      baseURL: fullNodeUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'TRON-PRO-API-KEY': this.apiKey }),
      },
    });

    // Initialize TronWeb instance
    this.tronWeb = new TronWeb({
      fullHost: fullNodeUrl,
      headers: this.apiKey ? { 'TRON-PRO-API-KEY': this.apiKey } : {},
      privateKey: this.privateKey || undefined,
    });

    this.logger.log(`TRON service initialized: ${fullNodeUrl}`);
    if (this.masterAddress) {
      this.logger.log(`TRON master address configured: ${this.masterAddress}`);
    }
  }

  getMasterAddress(): string {
    return this.masterAddress;
  }

  getPrivateKey(): string {
    return this.privateKey;
  }

  getHttpClient(): AxiosInstance {
    return this.httpClient;
  }

  getContractAddress(): string {
    return this.contractAddress;
  }

  async generateAddress(userId: string): Promise<string> {
    try {
      // Generate new TRON address
      const response = await this.httpClient.post('/wallet/generateaddress');
      const { address, hexAddress: _hexAddress, privateKey: _privateKey } = response.data;

      // Store address (NOTE: In production, private keys should be stored securely!)
      await this.prisma.walletAddress.create({
        data: {
          userId,
          currency: Currency.USDT_TRC20,
          network: Network.TRC20,
          address: address.base58 || address,
        },
      });

      this.logger.log(`Generated TRC20 address for user ${userId}: ${address}`);
      return address.base58 || address;
    } catch (error) {
      this.logger.error(`Failed to generate TRC20 address: ${error}`);
      throw error;
    }
  }

  async getOrCreateAddress(userId: string): Promise<string> {
    const existingAddress = await this.prisma.walletAddress.findFirst({
      where: {
        userId,
        currency: Currency.USDT_TRC20,
        network: Network.TRC20,
      },
    });

    if (existingAddress) {
      return existingAddress.address;
    }

    return this.generateAddress(userId);
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      return this.tronWeb.isAddress(address);
    } catch {
      return false;
    }
  }

  getTronWeb(): TronWeb {
    return this.tronWeb;
  }

  async getUsdtBalance(address: string): Promise<string> {
    try {
      // Use TronWeb contract to call balanceOf - handles encoding properly
      const contract = await this.tronWeb.contract().at(this.contractAddress);
      const balance = await contract.methods.balanceOf(address).call();
      const formattedBalance = (Number(balance) / 1e6).toString(); // USDT TRC20 has 6 decimals
      this.logger.debug(`USDT balance for ${address}: ${formattedBalance}`);
      return formattedBalance;
    } catch (error) {
      this.logger.error(`Failed to get TRC20 USDT balance for ${address}: ${error}`);
      return '0';
    }
  }

  async getTrxBalance(address: string): Promise<string> {
    try {
      // Use TronWeb to get TRX balance
      const balanceSun = await this.tronWeb.trx.getBalance(address);
      const formattedBalance = (balanceSun / 1e6).toString(); // TRX has 6 decimals (sun to TRX)
      this.logger.debug(`TRX balance for ${address}: ${formattedBalance}`);
      return formattedBalance;
    } catch (error) {
      this.logger.error(`Failed to get TRX balance for ${address}: ${error}`);
      return '0';
    }
  }

  async getTransaction(txId: string): Promise<TronTransaction | null> {
    try {
      const response = await this.httpClient.post('/wallet/gettransactionbyid', {
        value: txId,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get transaction ${txId}: ${error}`);
      return null;
    }
  }

  async getTransactionInfo(txId: string) {
    try {
      const response = await this.httpClient.post(
        '/wallet/gettransactioninfobyid',
        { value: txId },
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get transaction info ${txId}: ${error}`);
      return null;
    }
  }

  async getNowBlock() {
    try {
      const response = await this.httpClient.post('/wallet/getnowblock');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get current block: ${error}`);
      return null;
    }
  }

  async getBlockByNum(num: number) {
    try {
      const response = await this.httpClient.post('/wallet/getblockbynum', {
        num,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get block ${num}: ${error}`);
      return null;
    }
  }

  // Get TRC20 transfers for an address using TronGrid API
  async getTrc20Transfers(
    address: string,
    contractAddress: string = this.contractAddress,
    limit = 50,
  ): Promise<TronTransaction[]> {
    try {
      // This uses TronGrid API - adjust URL for your setup
      const response = await axios.get(
        `https://api.trongrid.io/v1/accounts/${address}/transactions/trc20`,
        {
          params: {
            only_to: true,
            contract_address: contractAddress,
            limit,
          },
          headers: this.apiKey ? { 'TRON-PRO-API-KEY': this.apiKey } : {},
        },
      );

      return response.data.data || [];
    } catch (error) {
      this.logger.error(`Failed to get TRC20 transfers: ${error}`);
      return [];
    }
  }

  private encodeAddress(address: string): string {
    // Convert Base58 TRON address to hex format for smart contract calls
    // TronWeb.address.toHex returns hex with '41' prefix (TRON's address prefix)
    // We need to remove the '41' prefix and pad to 64 characters for ABI encoding
    const hexAddress = this.tronWeb.address.toHex(address);
    // Remove '41' prefix and pad to 64 characters (32 bytes)
    return hexAddress.replace(/^41/, '').padStart(64, '0');
  }
}
