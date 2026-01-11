import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@easyx/database';
import { BtcService } from './btc.service';
import { BtcWatcherService } from './btc-watcher.service';
import { LedgerModule } from '../../ledger/ledger.module';
import { DepositModule } from '../../deposit/deposit.module';

@Module({
  imports: [ConfigModule, DatabaseModule, LedgerModule, DepositModule],
  providers: [BtcService, BtcWatcherService],
  exports: [BtcService],
})
export class BtcModule {}
