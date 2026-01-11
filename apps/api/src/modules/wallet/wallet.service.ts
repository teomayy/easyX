import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService, Network, Currency } from '@easyx/database';
import * as crypto from 'crypto';

const NETWORK_TO_CURRENCY: Record<Network, Currency> = {
  [Network.BTC]: Currency.BTC,
  [Network.LTC]: Currency.LTC,
  [Network.TRC20]: Currency.USDT_TRC20,
  [Network.ERC20]: Currency.USDT_ERC20,
};

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getUserAddresses(userId: string) {
    return this.prisma.walletAddress.findMany({
      where: { userId },
      select: {
        id: true,
        network: true,
        currency: true,
        address: true,
        createdAt: true,
      },
    });
  }

  async getOrCreateAddress(userId: string, network: Network) {
    const existing = await this.prisma.walletAddress.findFirst({
      where: { userId, network },
    });

    if (existing) {
      return existing;
    }

    return this.createAddress(userId, network);
  }

  async createAddress(userId: string, network: Network) {
    const address = await this.generateAddress(network);
    const currency = NETWORK_TO_CURRENCY[network];

    return this.prisma.walletAddress.create({
      data: {
        userId,
        network,
        currency,
        address,
      },
    });
  }

  async findByAddress(address: string) {
    return this.prisma.walletAddress.findUnique({
      where: { address },
    });
  }

  private async generateAddress(network: Network): Promise<string> {
    // TODO: Implement real address generation using HD wallets
    // This is a placeholder that generates a mock address
    // In production, use proper HD wallet derivation

    switch (network) {
      case Network.BTC:
        return this.generateMockBtcAddress();
      case Network.LTC:
        return this.generateMockLtcAddress();
      case Network.TRC20:
        return this.generateMockTronAddress();
      case Network.ERC20:
        return this.generateMockEthAddress();
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  }

  private generateMockBtcAddress(): string {
    // P2WPKH (native SegWit) format for mainnet: bc1q...
    const hash = crypto.randomBytes(20).toString('hex');
    return `bc1q${hash}`;
  }

  private generateMockLtcAddress(): string {
    // LTC addresses start with L, M, or ltc1
    const hash = crypto.randomBytes(20).toString('hex');
    return `ltc1q${hash}`;
  }

  private generateMockTronAddress(): string {
    // TRON addresses start with T
    const hash = crypto.randomBytes(20).toString('hex');
    return `T${hash.substring(0, 33).toUpperCase()}`;
  }

  private generateMockEthAddress(): string {
    // Ethereum addresses are 0x + 40 hex chars
    const hash = crypto.randomBytes(20).toString('hex');
    return `0x${hash}`;
  }
}
