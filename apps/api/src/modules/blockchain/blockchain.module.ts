import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@easyx/database';
import { BtcModule } from './btc/btc.module';
import { LtcModule } from './ltc/ltc.module';
import { EthModule } from './eth/eth.module';
import { TronModule } from './tron/tron.module';
import { LedgerModule } from '../ledger/ledger.module';
import { DepositModule } from '../deposit/deposit.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    LedgerModule,
    DepositModule,
    BtcModule,
    LtcModule,
    EthModule,
    TronModule,
  ],
  exports: [BtcModule, LtcModule, EthModule, TronModule],
})
export class BlockchainModule {}
