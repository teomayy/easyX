import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Network } from '@easyx/database';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('addresses')
  @ApiOperation({ summary: 'Get all deposit addresses for current user' })
  async getAddresses(@CurrentUser() user: { id: string }) {
    return this.walletService.getUserAddresses(user.id);
  }

  @Get('address/:network')
  @ApiOperation({ summary: 'Get or create deposit address for specific network' })
  @ApiParam({ name: 'network', enum: Network })
  async getAddress(@CurrentUser() user: { id: string }, @Param('network') network: Network) {
    return this.walletService.getOrCreateAddress(user.id, network);
  }

  @Post('address/:network')
  @ApiOperation({ summary: 'Create new deposit address for specific network' })
  @ApiParam({ name: 'network', enum: Network })
  async createAddress(@CurrentUser() user: { id: string }, @Param('network') network: Network) {
    return this.walletService.createAddress(user.id, network);
  }
}
