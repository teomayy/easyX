import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { DepositModule } from './modules/deposit/deposit.module';
import { WithdrawalModule } from './modules/withdrawal/withdrawal.module';
import { P2pModule } from './modules/p2p/p2p.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { AdminModule } from './modules/admin/admin.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import configuration from './config/configuration';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Modules
    HealthModule,
    AuthModule,
    UserModule,
    LedgerModule,
    WalletModule,
    DepositModule,
    WithdrawalModule,
    P2pModule,
    ExchangeModule,
    AdminModule,
    AdminAuthModule,
    BlockchainModule,
  ],
})
export class AppModule {}
