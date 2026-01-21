import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService, Currency, Network } from '@easyx/database';
import { ethers, HDNodeWallet, JsonRpcProvider, Contract, parseUnits, formatUnits } from 'ethers';

// USDT ERC20 Contract ABI (minimal for transfers)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

// USDT Contract Address (Mainnet: 0xdAC17F958D2ee523a2206206994597C13D831ec7)
// Sepolia testnet doesn't have official USDT, use mock or different token
const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

@Injectable()
export class EthService implements OnModuleInit {
  private readonly logger = new Logger(EthService.name);
  private provider: JsonRpcProvider;
  private masterWallet: HDNodeWallet | ethers.Wallet | null = null;
  private masterAddress: string = '';
  private usdtContract: Contract;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    const rpcUrl = this.configService.get<string>('blockchain.eth.rpcUrl', 'http://localhost:8545');
    const privateKey = this.configService.get<string>('blockchain.eth.privateKey', '');
    const mnemonic = this.configService.get<string>('blockchain.eth.mnemonic', '');
    const configuredAddress = this.configService.get<string>('blockchain.eth.masterAddress', '');
    const contractAddress = this.configService.get<string>(
      'blockchain.eth.usdtContract',
      USDT_CONTRACT_ADDRESS,
    );

    this.provider = new JsonRpcProvider(rpcUrl);

    // Initialize master wallet from private key or mnemonic
    if (privateKey) {
      try {
        const key = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
        this.masterWallet = new ethers.Wallet(key, this.provider);
        this.masterAddress = this.masterWallet.address;
        this.logger.log(`ETH master wallet initialized from private key: ${this.masterAddress}`);
      } catch (error) {
        this.logger.error(`Failed to initialize ETH wallet from private key: ${error}`);
      }
    } else if (mnemonic) {
      try {
        this.masterWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
        this.masterAddress = this.masterWallet.address;
        this.logger.log(`ETH master wallet initialized from mnemonic: ${this.masterAddress}`);
      } catch (error) {
        this.logger.error(`Failed to initialize ETH wallet from mnemonic: ${error}`);
      }
    } else if (configuredAddress) {
      this.masterAddress = configuredAddress;
      this.logger.log(`ETH master address configured: ${this.masterAddress}`);
    }

    this.usdtContract = new Contract(contractAddress, ERC20_ABI, this.provider);
    this.logger.log(`ETH service initialized: ${rpcUrl}`);
  }

  getMasterAddress(): string {
    return this.masterAddress;
  }

  getMasterWallet(): HDNodeWallet | ethers.Wallet | null {
    return this.masterWallet;
  }

  getProvider(): JsonRpcProvider {
    return this.provider;
  }

  getUsdtContract(): Contract {
    return this.usdtContract;
  }

  async generateAddress(userId: string): Promise<string> {
    try {
      if (!this.masterWallet) {
        throw new Error('ETH master wallet not initialized');
      }

      // Derive address from master wallet using user index (only for HD wallets)
      const userCount = await this.prisma.walletAddress.count({
        where: { network: Network.ERC20 },
      });

      let address: string;
      if ('deriveChild' in this.masterWallet && typeof this.masterWallet.deriveChild === 'function') {
        // HD Wallet - can derive child addresses
        const derivedWallet = (this.masterWallet as HDNodeWallet).deriveChild(userCount);
        address = derivedWallet.address;
      } else {
        // Regular wallet - use master address (single address mode)
        address = this.masterWallet.address;
        this.logger.warn('Using single address mode - consider using HD wallet for multi-user support');
      }

      await this.prisma.walletAddress.create({
        data: {
          userId,
          currency: Currency.USDT_ERC20,
          network: Network.ERC20,
          address,
        },
      });

      this.logger.log(`Generated ERC20 address for user ${userId}: ${address}`);
      return address;
    } catch (error) {
      this.logger.error(`Failed to generate ERC20 address: ${error}`);
      throw error;
    }
  }

  async getOrCreateAddress(userId: string): Promise<string> {
    const existingAddress = await this.prisma.walletAddress.findFirst({
      where: {
        userId,
        currency: Currency.USDT_ERC20,
        network: Network.ERC20,
      },
    });

    if (existingAddress) {
      return existingAddress.address;
    }

    return this.generateAddress(userId);
  }

  async validateAddress(address: string): Promise<boolean> {
    return ethers.isAddress(address);
  }

  async getUsdtBalance(address: string): Promise<string> {
    try {
      const balance = await this.usdtContract.balanceOf(address);
      return formatUnits(balance, 6); // USDT has 6 decimals
    } catch (error) {
      this.logger.error(`Failed to get USDT balance: ${error}`);
      return '0';
    }
  }

  async getEthBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return formatUnits(balance, 18);
    } catch (error) {
      this.logger.error(`Failed to get ETH balance: ${error}`);
      return '0';
    }
  }

  async sendUsdt(toAddress: string, amount: string, privateKey: string): Promise<string> {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contract = new Contract(
        await this.usdtContract.getAddress(),
        ERC20_ABI,
        wallet,
      );

      const amountWei = parseUnits(amount, 6);
      const tx = await contract.transfer(toAddress, amountWei);
      const receipt = await tx.wait();

      this.logger.log(`Sent ${amount} USDT to ${toAddress}, tx: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error(`Failed to send USDT: ${error}`);
      throw error;
    }
  }

  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  async getTransaction(txHash: string) {
    return this.provider.getTransaction(txHash);
  }

  async getTransactionReceipt(txHash: string) {
    return this.provider.getTransactionReceipt(txHash);
  }

  async estimateGas(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || BigInt(20000000000); // 20 Gwei default
  }
}
