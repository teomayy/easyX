import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { RatesService } from './rates.service';
import { DatabaseModule } from '@easyx/database';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [DatabaseModule, LedgerModule, HttpModule],
  controllers: [ExchangeController],
  providers: [ExchangeService, RatesService],
  exports: [ExchangeService, RatesService],
})
export class ExchangeModule {}
