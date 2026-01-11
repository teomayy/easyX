import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DatabaseModule } from '@easyx/database';
import { WithdrawalModule } from '../withdrawal/withdrawal.module';

@Module({
  imports: [DatabaseModule, WithdrawalModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
