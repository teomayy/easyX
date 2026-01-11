'use client';

import { useEffect, useState } from 'react';
import { Loader2, ArrowDownToLine, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminDepositsApi } from '@/lib/api';
import { formatAmount, truncateAddress } from '@/lib/utils';

interface Deposit {
  id: string;
  userId: string;
  currency: string;
  network: string;
  txHash: string;
  amount: string;
  confirmations: number;
  status: string;
  createdAt: string;
  user?: {
    phone: string | null;
    username: string | null;
  };
}

const statuses = ['', 'PENDING', 'CONFIRMED', 'FAILED'];

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    fetchDeposits();
  }, [statusFilter, page]);

  const fetchDeposits = async () => {
    setIsLoading(true);
    try {
      const response = await adminDepositsApi.getDeposits({
        status: statusFilter || undefined,
        limit,
        offset: page * limit,
      });
      setDeposits(response.data.deposits || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
      // Mock data for demo
      setDeposits([
        {
          id: 'd1',
          userId: 'user1',
          currency: 'BTC',
          network: 'BTC',
          txHash:
            '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          amount: '0.5',
          confirmations: 6,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          user: { phone: '+998901234567', username: 'john_doe' },
        },
        {
          id: 'd2',
          userId: 'user2',
          currency: 'USDT_TRC20',
          network: 'TRC20',
          txHash:
            '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          amount: '1000',
          confirmations: 2,
          status: 'PENDING',
          createdAt: new Date(Date.now() - 600000).toISOString(),
          user: { phone: '+998907654321', username: null },
        },
      ]);
      setTotal(2);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const pendingCount = deposits.filter((d) => d.status === 'PENDING').length;
  const confirmedCount = deposits.filter((d) => d.status === 'CONFIRMED').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Депозиты</h1>
        <p className="text-muted-foreground">
          Мониторинг входящих депозитов
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ожидают</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Подтверждено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {confirmedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownToLine className="h-5 w-5" />
                История депозитов
              </CardTitle>
              <CardDescription>Все входящие транзакции</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все</SelectItem>
                {statuses.slice(1).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : deposits.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Депозиты не найдены
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium">Время</th>
                      <th className="pb-3 font-medium">Пользователь</th>
                      <th className="pb-3 font-medium">Сумма</th>
                      <th className="pb-3 font-medium">Сеть</th>
                      <th className="pb-3 font-medium">TX Hash</th>
                      <th className="pb-3 font-medium">Подтверждения</th>
                      <th className="pb-3 font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map((deposit) => (
                      <tr key={deposit.id} className="border-b">
                        <td className="py-3 text-muted-foreground">
                          {new Date(deposit.createdAt).toLocaleString('ru-RU')}
                        </td>
                        <td className="py-3">
                          {deposit.user?.username ||
                            deposit.user?.phone ||
                            deposit.userId.slice(0, 8) + '...'}
                        </td>
                        <td className="py-3 font-medium text-green-500">
                          +{formatAmount(deposit.amount)} {deposit.currency}
                        </td>
                        <td className="py-3">{deposit.network}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <code className="text-xs text-muted-foreground">
                              {truncateAddress(deposit.txHash, 8)}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                window.open(
                                  `https://www.blockchain.com/explorer/transactions/${deposit.network.toLowerCase()}/${deposit.txHash}`,
                                  '_blank'
                                )
                              }
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="py-3">{deposit.confirmations}</td>
                        <td className="py-3">
                          <StatusBadge status={deposit.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Назад
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Страница {page + 1} из {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                  >
                    Вперед
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: {
    [key: string]: { label: string; className: string };
  } = {
    PENDING: { label: 'Ожидание', className: 'bg-yellow-500/20 text-yellow-500' },
    CONFIRMED: {
      label: 'Подтвержден',
      className: 'bg-green-500/20 text-green-500',
    },
    FAILED: { label: 'Ошибка', className: 'bg-red-500/20 text-red-500' },
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
