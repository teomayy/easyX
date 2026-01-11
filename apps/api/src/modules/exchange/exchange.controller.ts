import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExchangeService } from './exchange.service';
import { RatesService } from './rates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateSwapDto } from './dto/create-swap.dto';
import { GetQuoteDto } from './dto/get-quote.dto';
import { GetTradesDto } from './dto/get-trades.dto';

@ApiTags('Exchange')
@Controller('exchange')
export class ExchangeController {
  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly ratesService: RatesService,
  ) {}

  @Get('rates')
  @ApiOperation({ summary: 'Get all exchange rates' })
  async getRates() {
    return this.ratesService.getAllRates();
  }

  @Get('quote')
  @ApiOperation({ summary: 'Get swap quote' })
  async getQuote(@Query() query: GetQuoteDto) {
    return this.exchangeService.getQuote(query);
  }

  @Post('swap')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Execute swap' })
  async createSwap(@CurrentUser() user: { id: string }, @Body() dto: CreateSwapDto) {
    return this.exchangeService.executeSwap(user.id, dto);
  }

  @Get('trades')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get trade history' })
  async getTrades(@CurrentUser() user: { id: string }, @Query() query: GetTradesDto) {
    return this.exchangeService.getUserTrades(user.id, query);
  }
}
