'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  ArrowUpFromLine,
  ArrowDownToLine,
  RefreshCw,
  Loader2,
  TrendingUp,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { adminDashboardApi } from '@/lib/api';
import { formatAmount } from '@/lib/utils';

interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalDeposits: string;
  depositsToday: string;
  totalWithdrawals: string;
  withdrawalsToday: string;
  pendingWithdrawals: number;
  totalTrades: number;
  tradesToday: number;
  totalVolume: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminDashboardApi.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Set mock data for demo
        setStats({
          totalUsers: 1234,
          newUsersToday: 45,
          totalDeposits: '1234567.89',
          depositsToday: '45678.90',
          totalWithdrawals: '987654.32',
          withdrawalsToday: '23456.78',
          pendingWithdrawals: 12,
          totalTrades: 5678,
          tradesToday: 234,
          totalVolume: '9876543.21',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
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
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Обзор активности платформы
        </p>
      </div>

      {/* Alert for pending withdrawals */}
      {stats && stats.pendingWithdrawals > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <div>
              <p className="font-medium text-yellow-500">
                {stats.pendingWithdrawals} заявок на вывод ожидают обработки
              </p>
              <p className="text-sm text-muted-foreground">
                Перейдите в раздел &quot;Выводы&quot; для обработки
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Пользователи"
          value={stats?.totalUsers.toLocaleString() || '0'}
          subtitle={`+${stats?.newUsersToday || 0} сегодня`}
          icon={<Users className="h-5 w-5" />}
          trend="up"
        />
        <StatsCard
          title="Депозиты"
          value={`$${formatAmount(stats?.totalDeposits || '0', 2)}`}
          subtitle={`$${formatAmount(stats?.depositsToday || '0', 2)} сегодня`}
          icon={<ArrowDownToLine className="h-5 w-5" />}
          trend="up"
        />
        <StatsCard
          title="Выводы"
          value={`$${formatAmount(stats?.totalWithdrawals || '0', 2)}`}
          subtitle={`$${formatAmount(stats?.withdrawalsToday || '0', 2)} сегодня`}
          icon={<ArrowUpFromLine className="h-5 w-5" />}
          trend="up"
        />
        <StatsCard
          title="Обмены"
          value={stats?.totalTrades.toLocaleString() || '0'}
          subtitle={`${stats?.tradesToday || 0} сегодня`}
          icon={<RefreshCw className="h-5 w-5" />}
          trend="up"
        />
      </div>

      {/* Volume Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Общий объем
          </CardTitle>
          <CardDescription>Суммарный объем всех операций</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">
            ${formatAmount(stats?.totalVolume || '0', 2)}
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Последние депозиты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium">User #{1000 + i}</p>
                    <p className="text-sm text-muted-foreground">BTC</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-500">+0.{i}5 BTC</p>
                    <p className="text-sm text-muted-foreground">
                      {i} мин назад
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Последние выводы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium">User #{2000 + i}</p>
                    <p className="text-sm text-muted-foreground">USDT TRC20</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-500">-{i * 100} USDT</p>
                    <StatusBadge
                      status={i % 3 === 0 ? 'PENDING' : 'COMPLETED'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={`text-xs ${
            trend === 'up' ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: {
    [key: string]: { label: string; className: string };
  } = {
    PENDING: { label: 'Ожидание', className: 'bg-yellow-500/20 text-yellow-500' },
    COMPLETED: {
      label: 'Завершен',
      className: 'bg-green-500/20 text-green-500',
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
