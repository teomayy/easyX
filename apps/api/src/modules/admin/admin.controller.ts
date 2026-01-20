import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard';
import { GetUsersDto } from './dto/get-users.dto';
import { ProcessWithdrawalDto } from './dto/process-withdrawal.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  async getUsers(@Query() query: GetUsersDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  async getUser(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Get('withdrawals/pending')
  @ApiOperation({ summary: 'Get pending withdrawals' })
  async getPendingWithdrawals() {
    return this.adminService.getPendingWithdrawals();
  }

  @Post('withdrawals/:id/approve')
  @ApiOperation({ summary: 'Approve withdrawal' })
  async approveWithdrawal(@Param('id') id: string) {
    return this.adminService.approveWithdrawal(id);
  }

  @Post('withdrawals/:id/reject')
  @ApiOperation({ summary: 'Reject withdrawal' })
  async rejectWithdrawal(@Param('id') id: string, @Body() dto: ProcessWithdrawalDto) {
    return this.adminService.rejectWithdrawal(id, dto.reason ?? 'Rejected by admin');
  }

  @Get('ledger')
  @ApiOperation({ summary: 'Get ledger entries' })
  async getLedger(@Query() query: { limit?: number; offset?: number }) {
    return this.adminService.getLedgerEntries(query);
  }

  @Patch('users/:id/kyc')
  @ApiOperation({ summary: 'Update user KYC status' })
  async updateKyc(@Param('id') id: string, @Body() dto: { status: string }) {
    return this.adminService.updateUserKyc(id, dto.status);
  }
}
