'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, ArrowDownUp, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ledgerApi, exchangeApi } from '@/lib/api';
import { formatAmount } from '@/lib/utils';

interface Balance {
  currency: string;
  available: string;
  held: string;
  total: string;
}

interface Quote {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  rate: string;
  expiresAt: string;
}

interface Trade {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  rate: string;
  createdAt: string;
}

const currencies = ['BTC', 'LTC', 'USDT_TRC20', 'USDT_ERC20', 'UZS'];

export default function SwapPage() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('USDT_TRC20');
  const [fromAmount, setFromAmount] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balancesRes, tradesRes] = await Promise.all([
          ledgerApi.getBalances(),
          exchangeApi.getTrades({ limit: 10 }),
        ]);
        setBalances(balancesRes.data);
        setTrades(tradesRes.data.trades || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fromBalance = balances.find((b) => b.currency === fromCurrency);

  const fetchQuote = useCallback(async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0 || fromCurrency === toCurrency) {
      setQuote(null);
      return;
    }

    setIsQuoting(true);
    try {
      const response = await exchangeApi.getQuote({
        fromCurrency,
        toCurrency,
        amount: fromAmount,
      });
      setQuote(response.data);
    } catch (error) {
      setQuote(null);
    } finally {
      setIsQuoting(false);
    }
  }, [fromAmount, fromCurrency, toCurrency]);

  // Debounced quote fetching
  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timer);
  }, [fetchQuote]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount('');
    setQuote(null);
  };

  const handleSwap = async () => {
    if (!quote || !fromBalance) return;

    const fromAmountNum = parseFloat(fromAmount);
    const availableNum = parseFloat(fromBalance.available);

    if (fromAmountNum > availableNum) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Недостаточно средств',
      });
      return;
    }

    setIsSwapping(true);
    try {
      await exchangeApi.swap({
        fromCurrency,
        toCurrency,
        fromAmount,
      });
      toast({
        title: 'Обмен выполнен',
        description: `${fromAmount} ${fromCurrency} → ${quote.toAmount} ${toCurrency}`,
      });
      setFromAmount('');
      setQuote(null);
      // Refresh data
      const [balancesRes, tradesRes] = await Promise.all([
        ledgerApi.getBalances(),
        exchangeApi.getTrades({ limit: 10 }),
      ]);
      setBalances(balancesRes.data);
      setTrades(tradesRes.data.trades || []);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Не удалось выполнить обмен';
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: errorMessage,
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const setMaxAmount = () => {
    if (fromBalance) {
      setFromAmount(fromBalance.available);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Обмен валют</h1>
        <p className="text-muted-foreground">
          Конвертируйте криптовалюты по лучшим курсам
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Быстрый обмен
          </CardTitle>
          <CardDescription>
            Курсы обновляются автоматически с биржи Binance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Currency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Отдаете</Label>
              {fromBalance && (
                <button
                  type="button"
                  onClick={setMaxAmount}
                  className="text-sm text-primary hover:underline"
                >
                  Баланс: {formatAmount(fromBalance.available)}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies
                    .filter((c) => c !== toCurrency)
                    .map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapCurrencies}
              className="rounded-full"
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <Label>Получаете</Label>
            <div className="flex gap-2">
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies
                    .filter((c) => c !== fromCurrency)
                    .map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex flex-1 items-center rounded-md border bg-muted px-3">
                {isQuoting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <span className="text-lg">
                    {quote ? formatAmount(quote.toAmount) : '0.00'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rate Info */}
          {quote && (
            <div className="rounded-lg bg-muted p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Курс</span>
                <span>
                  1 {fromCurrency} = {formatAmount(quote.rate)} {toCurrency}
                </span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-muted-foreground">Маржа</span>
                <span>1.5%</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleSwap}
            className="w-full"
            disabled={isSwapping || !quote || !fromAmount}
          >
            {isSwapping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Обменять
          </Button>
        </CardContent>
      </Card>

      {/* Trade History */}
      <Card>
        <CardHeader>
          <CardTitle>История обменов</CardTitle>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              У вас пока нет обменов
            </p>
          ) : (
            <div className="space-y-4">
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {trade.fromCurrency} → {trade.toCurrency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Курс: {formatAmount(trade.rate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-500">-{trade.fromAmount}</p>
                    <p className="text-green-500">+{trade.toAmount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
