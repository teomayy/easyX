import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { P2pService } from './p2p.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { GetTransfersDto } from './dto/get-transfers.dto';

@ApiTags('P2P')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('p2p')
export class P2pController {
  constructor(private readonly p2pService: P2pService) {}

  @Post('transfer')
  @ApiOperation({ summary: 'Send P2P transfer to another user' })
  async createTransfer(@CurrentUser() user: { id: string }, @Body() dto: CreateTransferDto) {
    return this.p2pService.createTransfer(user.id, dto);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Get P2P transfer history' })
  async getTransfers(@CurrentUser() user: { id: string }, @Query() query: GetTransfersDto) {
    return this.p2pService.getUserTransfers(user.id, query);
  }
}
