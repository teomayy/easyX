import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Decimal } from '@easyx/database';
import { Currency } from '@easyx/database';
import { firstValueFrom } from 'rxjs';

interface BinancePrice {
  symbol: string;
  price: string;
}

@Injectable()
export class RatesService implements OnModuleInit {
  private rates: Map<string, Decimal> = new Map();
  private lastUpdate: Date = new Date(0);
  private readonly marginPercent: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.marginPercent = this.configService.get<number>('exchange.marginPercent') ?? 1.5;
  }

  async onModuleInit() {
    await this.updateRates();
    // Update rates every minute
    setInterval(() => this.updateRates(), 60000);
  }

  async getRate(from: Currency, to: Currency): Promise<Decimal> {
    // Ensure rates are fresh
    if (Date.now() - this.lastUpdate.getTime() > 120000) {
      await this.updateRates();
    }

    const key = `${from}_${to}`;
    const cachedRate = this.rates.get(key);
    if (cachedRate) {
      return cachedRate;
    }

    // Calculate cross rate
    const fromUsd = await this.getUsdRate(from);
    const toUsd = await this.getUsdRate(to);

    const rate = fromUsd.dividedBy(toUsd);

    // Apply margin
    const marginMultiplier = new Decimal(1).minus(new Decimal(this.marginPercent).dividedBy(100));
    return rate.times(marginMultiplier);
  }

  async getAllRates() {
    const currencies = Object.values(Currency);
    const rates: Record<string, Record<string, string>> = {};

    for (const from of currencies) {
      rates[from] = {};
      for (const to of currencies) {
        if (from !== to) {
          const rate = await this.getRate(from, to);
          rates[from][to] = rate.toString();
        }
      }
    }

    return {
      rates,
      marginPercent: this.marginPercent,
      updatedAt: this.lastUpdate.toISOString(),
    };
  }

  private async getUsdRate(currency: Currency): Promise<Decimal> {
    // USDT is pegged to USD
    if (currency === Currency.USDT_TRC20 || currency === Currency.USDT_ERC20) {
      return new Decimal(1);
    }

    // UZS rate (hardcoded for now, should be from external API)
    if (currency === Currency.UZS) {
      return new Decimal(1).dividedBy(12500); // ~12500 UZS per USD
    }

    const symbol = this.getCurrencySymbol(currency);
    const rate = this.rates.get(`${symbol}USDT`);
    return rate ?? new Decimal(0);
  }

  private async updateRates() {
    try {
      const symbols = ['BTCUSDT', 'LTCUSDT'];
      const response = await firstValueFrom(
        this.httpService.get<BinancePrice[]>('https://api.binance.com/api/v3/ticker/price', {
          params: { symbols: JSON.stringify(symbols) },
        }),
      );

      for (const { symbol, price } of response.data) {
        this.rates.set(symbol, new Decimal(price));
      }

      this.lastUpdate = new Date();
    } catch (error) {
      console.error('Failed to update rates from Binance:', error);
      // Use fallback rates if API fails
      this.setFallbackRates();
    }
  }

  private setFallbackRates() {
    // Fallback rates in case Binance API is unavailable
    this.rates.set('BTCUSDT', new Decimal(42000));
    this.rates.set('LTCUSDT', new Decimal(70));
  }

  private getCurrencySymbol(currency: Currency): string {
    switch (currency) {
      case Currency.BTC:
        return 'BTC';
      case Currency.LTC:
        return 'LTC';
      default:
        return currency;
    }
  }
}
