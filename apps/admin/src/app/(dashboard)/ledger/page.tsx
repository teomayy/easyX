'use client';

import { useEffect, useState } from 'react';
import { Search, Loader2, FileText, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { adminLedgerApi } from '@/lib/api';
import { formatAmount } from '@/lib/utils';

interface LedgerEntry {
  id: string;
  userId: string;
  currency: string;
  amount: string;
  type: 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE';
  operation: string;
  referenceId: string;
  balanceBefore: string;
  balanceAfter: string;
  createdAt: string;
  user?: {
    phone: string | null;
    username: string | null;
  };
}

const currencies = ['all', 'BTC', 'LTC', 'USDT_TRC20', 'USDT_ERC20', 'UZS'];
const operations = ['all', 'deposit', 'withdrawal', 'p2p', 'swap'];
const entryTypes = ['all', 'CREDIT', 'DEBIT', 'HOLD', 'RELEASE'];

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userIdFilter, setUserIdFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [operationFilter, setOperationFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    fetchEntries();
  }, [userIdFilter, currencyFilter, operationFilter, page]);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const response = await adminLedgerApi.getEntries({
        userId: userIdFilter || undefined,
        currency: currencyFilter === 'all' ? undefined : currencyFilter,
        operation: operationFilter === 'all' ? undefined : operationFilter,
        limit,
        offset: page * limit,
      });
      setEntries(response.data.entries || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch ledger:', error);
      // Mock data for demo
      setEntries([
        {
          id: 'e1',
          userId: 'user1',
          currency: 'BTC',
          amount: '0.5',
          type: 'CREDIT',
          operation: 'deposit',
          referenceId: 'dep1',
          balanceBefore: '0',
          balanceAfter: '0.5',
          createdAt: new Date().toISOString(),
          user: { phone: '+998901234567', username: 'john_doe' },
        },
        {
          id: 'e2',
          userId: 'user1',
          currency: 'BTC',
          amount: '0.1',
          type: 'HOLD',
          operation: 'withdrawal',
          referenceId: 'wd1',
          balanceBefore: '0.5',
          balanceAfter: '0.4',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          user: { phone: '+998901234567', username: 'john_doe' },
        },
        {
          id: 'e3',
          userId: 'user2',
          currency: 'USDT_TRC20',
          amount: '1000',
          type: 'CREDIT',
          operation: 'deposit',
          referenceId: 'dep2',
          balanceBefore: '0',
          balanceAfter: '1000',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          user: { phone: '+998907654321', username: null },
        },
      ]);
      setTotal(3);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ledger</h1>
        <p className="text-muted-foreground">
          Журнал всех операций с балансами
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Журнал операций
              </CardTitle>
              <CardDescription>Всего записей: {total}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="User ID..."
                  value={userIdFilter}
                  onChange={(e) => setUserIdFilter(e.target.value)}
                  className="pl-9 w-40"
                />
              </div>
              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Валюта" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  {currencies.slice(1).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={operationFilter}
                onValueChange={setOperationFilter}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Операция" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  {operations.slice(1).map((op) => (
                    <SelectItem key={op} value={op}>
                      {op}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Записи не найдены
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium">Время</th>
                      <th className="pb-3 font-medium">Пользователь</th>
                      <th className="pb-3 font-medium">Тип</th>
                      <th className="pb-3 font-medium">Операция</th>
                      <th className="pb-3 font-medium">Валюта</th>
                      <th className="pb-3 font-medium text-right">Сумма</th>
                      <th className="pb-3 font-medium text-right">
                        Баланс до
                      </th>
                      <th className="pb-3 font-medium text-right">
                        Баланс после
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b">
                        <td className="py-3 text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString('ru-RU')}
                        </td>
                        <td className="py-3">
                          {entry.user?.username ||
                            entry.user?.phone ||
                            entry.userId.slice(0, 8) + '...'}
                        </td>
                        <td className="py-3">
                          <TypeBadge type={entry.type} />
                        </td>
                        <td className="py-3">
                          <span className="rounded bg-muted px-2 py-0.5 text-xs">
                            {entry.operation}
                          </span>
                        </td>
                        <td className="py-3">{entry.currency}</td>
                        <td
                          className={`py-3 text-right font-mono ${
                            entry.type === 'CREDIT' || entry.type === 'RELEASE'
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {entry.type === 'CREDIT' || entry.type === 'RELEASE'
                            ? '+'
                            : '-'}
                          {formatAmount(entry.amount)}
                        </td>
                        <td className="py-3 text-right font-mono text-muted-foreground">
                          {formatAmount(entry.balanceBefore)}
                        </td>
                        <td className="py-3 text-right font-mono">
                          {formatAmount(entry.balanceAfter)}
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

function TypeBadge({ type }: { type: string }) {
  const typeConfig: {
    [key: string]: { label: string; className: string };
  } = {
    CREDIT: { label: 'CREDIT', className: 'bg-green-500/20 text-green-500' },
    DEBIT: { label: 'DEBIT', className: 'bg-red-500/20 text-red-500' },
    HOLD: { label: 'HOLD', className: 'bg-yellow-500/20 text-yellow-500' },
    RELEASE: { label: 'RELEASE', className: 'bg-blue-500/20 text-blue-500' },
  };

  const config = typeConfig[type] || typeConfig.CREDIT;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
