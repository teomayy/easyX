import { Module } from '@nestjs/common';
import { P2pController } from './p2p.controller';
import { P2pService } from './p2p.service';
import { DatabaseModule } from '@easyx/database';
import { LedgerModule } from '../ledger/ledger.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DatabaseModule, LedgerModule, UserModule],
  controllers: [P2pController],
  providers: [P2pService],
  exports: [P2pService],
})
export class P2pModule {}
