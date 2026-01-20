import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminWalletService } from './admin-wallet.service';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard';

class SendCryptoDto {
  currency: string;
  network: string;
  toAddress: string;
  amount: string;
}

@ApiTags('Admin Wallets')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard)
@Controller('admin/wallets')
export class AdminWalletController {
  constructor(private readonly walletService: AdminWalletService) {}

  @Get('balances')
  @ApiOperation({ summary: 'Get all wallet balances' })
  async getBalances() {
    return this.walletService.getWalletBalances();
  }

  @Get('nodes')
  @ApiOperation({ summary: 'Get node statuses' })
  async getNodeStatuses() {
    return this.walletService.getNodeStatuses();
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Get wallet addresses' })
  async getAddresses(
    @Query() query: { currency?: string; userId?: string; limit?: number; offset?: number },
  ) {
    return this.walletService.getWalletAddresses(query);
  }

  @Get('addresses/stats')
  @ApiOperation({ summary: 'Get address statistics' })
  async getAddressStats() {
    return this.walletService.getAddressStats();
  }

  @Post('send')
  @ApiOperation({ summary: 'Send cryptocurrency' })
  async sendCrypto(@Body() dto: SendCryptoDto) {
    return this.walletService.sendCrypto(dto);
  }
}
