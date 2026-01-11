import { Module } from '@nestjs/common';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';
import { BalanceService } from './balance.service';
import { DatabaseModule } from '@easyx/database';

@Module({
  imports: [DatabaseModule],
  controllers: [LedgerController],
  providers: [LedgerService, BalanceService],
  exports: [LedgerService, BalanceService],
})
export class LedgerModule {}
