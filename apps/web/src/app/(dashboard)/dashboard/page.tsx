'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  Users,
  TrendingUp,
  TrendingDown,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ledgerApi, exchangeApi } from '@/lib/api';
import { formatAmount } from '@/lib/utils';

interface Balance {
  currency: string;
  available: string;
  held: string;
  total: string;
}

interface Rates {
  [key: string]: { [key: string]: string };
}

const currencyNames: { [key: string]: string } = {
  BTC: 'Bitcoin',
  LTC: 'Litecoin',
  USDT_TRC20: 'USDT TRC20',
  USDT_ERC20: 'USDT ERC20',
  UZS: 'Uzbek Som',
};

const currencyIcons: { [key: string]: string } = {
  BTC: 'BT',
  LTC: 'LT',
  USDT_TRC20: 'UT',
  USDT_ERC20: 'UE',
  UZS: 'UZ',
};

export default function DashboardPage() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [rates, setRates] = useState<Rates>({});
  const [isLoading, setIsLoading] = useState(true);
  const [totalUSD, setTotalUSD] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balancesRes, ratesRes] = await Promise.all([
          ledgerApi.getBalances(),
          exchangeApi.getRates(),
        ]);
        setBalances(balancesRes.data);
        setRates(ratesRes.data.rates || {});

        // Calculate total in USD
        const usdTotal = balancesRes.data.reduce(
          (sum: number, balance: Balance) => {
            const amount = parseFloat(balance.total);
            if (balance.currency === 'USDT_TRC20' || balance.currency === 'USDT_ERC20') {
              return sum + amount;
            }
            const rate = ratesRes.data.rates?.[balance.currency]?.USDT_TRC20;
            if (rate) {
              return sum + amount * parseFloat(rate);
            }
            return sum;
          },
          0
        );
        setTotalUSD(usdTotal);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Balance Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <CardDescription>Общий баланс</CardDescription>
          <CardTitle className="text-4xl">
            ${formatAmount(totalUSD.toFixed(2), 2)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/deposit">
              <Button size="sm" className="gap-2">
                <ArrowDownToLine className="h-4 w-4" />
                Пополнить
              </Button>
            </Link>
            <Link href="/withdraw">
              <Button size="sm" variant="outline" className="gap-2">
                <ArrowUpFromLine className="h-4 w-4" />
                Вывести
              </Button>
            </Link>
            <Link href="/swap">
              <Button size="sm" variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Обменять
              </Button>
            </Link>
            <Link href="/transfer">
              <Button size="sm" variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Перевести
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Balances Grid */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Мои балансы</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {balances.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-muted-foreground">
                  У вас пока нет балансов
                </p>
                <Link href="/deposit">
                  <Button>Пополнить кошелек</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            balances.map((balance) => (
              <BalanceCard
                key={balance.currency}
                balance={balance}
                rates={rates}
              />
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Быстрые действия</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            href="/deposit"
            icon={<ArrowDownToLine className="h-6 w-6" />}
            title="Пополнить"
            description="Получить криптовалюту"
          />
          <QuickActionCard
            href="/withdraw"
            icon={<ArrowUpFromLine className="h-6 w-6" />}
            title="Вывести"
            description="Отправить на внешний кошелек"
          />
          <QuickActionCard
            href="/swap"
            icon={<RefreshCw className="h-6 w-6" />}
            title="Обменять"
            description="Конвертировать валюты"
          />
          <QuickActionCard
            href="/transfer"
            icon={<Users className="h-6 w-6" />}
            title="P2P перевод"
            description="Отправить пользователю"
          />
        </div>
      </div>
    </div>
  );
}

function BalanceCard({
  balance,
  rates,
}: {
  balance: Balance;
  rates: Rates;
}) {
  const usdValue = (() => {
    const amount = parseFloat(balance.total);
    if (balance.currency === 'USDT_TRC20' || balance.currency === 'USDT_ERC20') {
      return amount;
    }
    const rate = rates[balance.currency]?.USDT_TRC20;
    if (rate) {
      return amount * parseFloat(rate);
    }
    return 0;
  })();

  const hasHeld = parseFloat(balance.held) > 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {currencyIcons[balance.currency] || balance.currency.slice(0, 2)}
            </div>
            <div>
              <p className="font-medium">
                {currencyNames[balance.currency] || balance.currency}
              </p>
              <p className="text-sm text-muted-foreground">{balance.currency}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {usdValue > 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">
                  ${formatAmount(usdValue.toFixed(2), 2)}
                </span>
              </>
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold">
            {formatAmount(balance.available)}
          </p>
          {hasHeld && (
            <p className="text-sm text-muted-foreground">
              Заморожено: {formatAmount(balance.held)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-accent">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
