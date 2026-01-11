import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@easyx/database';
import { EthService } from './eth.service';
import { EthWatcherService } from './eth-watcher.service';
import { LedgerModule } from '../../ledger/ledger.module';
import { DepositModule } from '../../deposit/deposit.module';

@Module({
  imports: [ConfigModule, DatabaseModule, LedgerModule, DepositModule],
  providers: [EthService, EthWatcherService],
  exports: [EthService],
})
export class EthModule {}
