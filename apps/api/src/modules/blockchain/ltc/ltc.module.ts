import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@easyx/database';
import { LtcService } from './ltc.service';
import { LtcWatcherService } from './ltc-watcher.service';
import { LedgerModule } from '../../ledger/ledger.module';
import { DepositModule } from '../../deposit/deposit.module';

@Module({
  imports: [ConfigModule, DatabaseModule, LedgerModule, DepositModule],
  providers: [LtcService, LtcWatcherService],
  exports: [LtcService],
})
export class LtcModule {}
