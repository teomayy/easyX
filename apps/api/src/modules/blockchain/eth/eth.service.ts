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
  private masterWallet: HDNodeWallet;
  private usdtContract: Contract;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    const rpcUrl = this.configService.get<string>('blockchain.eth.rpcUrl', 'http://localhost:8545');
    const mnemonic = this.configService.get<string>('blockchain.eth.mnemonic', '');
    const contractAddress = this.configService.get<string>(
      'blockchain.eth.usdtContract',
      USDT_CONTRACT_ADDRESS,
    );

    this.provider = new JsonRpcProvider(rpcUrl);

    if (mnemonic) {
      this.masterWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
      this.logger.log('ETH master wallet initialized');
    }

    this.usdtContract = new Contract(contractAddress, ERC20_ABI, this.provider);
    this.logger.log(`ETH service initialized: ${rpcUrl}`);
  }

  getProvider(): JsonRpcProvider {
    return this.provider;
  }

  getUsdtContract(): Contract {
    return this.usdtContract;
  }

  async generateAddress(userId: string): Promise<string> {
    try {
      // Derive address from master wallet using user index
      const userCount = await this.prisma.walletAddress.count({
        where: { network: Network.ERC20 },
      });

      const derivedWallet = this.masterWallet.deriveChild(userCount);
      const address = derivedWallet.address;

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
