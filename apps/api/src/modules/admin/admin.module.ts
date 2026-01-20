import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminWalletController } from './admin-wallet.controller';
import { AdminWalletService } from './admin-wallet.service';
import { DatabaseModule } from '@easyx/database';
import { WithdrawalModule } from '../withdrawal/withdrawal.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [ConfigModule, DatabaseModule, WithdrawalModule, BlockchainModule],
  controllers: [AdminController, AdminWalletController],
  providers: [AdminService, AdminWalletService],
  exports: [AdminService],
})
export class AdminModule {}
