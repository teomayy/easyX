import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@easyx/database';
import { TronService } from './tron.service';
import { TronWatcherService } from './tron-watcher.service';
import { LedgerModule } from '../../ledger/ledger.module';
import { DepositModule } from '../../deposit/deposit.module';

@Module({
  imports: [ConfigModule, DatabaseModule, LedgerModule, DepositModule],
  providers: [TronService, TronWatcherService],
  exports: [TronService],
})
export class TronModule {}
