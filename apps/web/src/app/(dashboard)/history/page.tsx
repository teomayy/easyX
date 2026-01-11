'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  Users,
  Loader2,
  Filter,
} from 'lucide-react';

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
import { ledgerApi } from '@/lib/api';
import { formatAmount } from '@/lib/utils';

interface LedgerEntry {
  id: string;
  currency: string;
  amount: string;
  type: 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE';
  operation: string;
  referenceId: string;
  balanceBefore: string;
  balanceAfter: string;
  createdAt: string;
}

const operationLabels: { [key: string]: string } = {
  deposit: 'Депозит',
  withdrawal: 'Вывод',
  p2p: 'P2P перевод',
  swap: 'Обмен',
};

const operationIcons: { [key: string]: React.ReactNode } = {
  deposit: <ArrowDownToLine className="h-5 w-5" />,
  withdrawal: <ArrowUpFromLine className="h-5 w-5" />,
  p2p: <Users className="h-5 w-5" />,
  swap: <RefreshCw className="h-5 w-5" />,
};

const currencies = ['', 'BTC', 'LTC', 'USDT_TRC20', 'USDT_ERC20', 'UZS'];
const operations = ['', 'deposit', 'withdrawal', 'p2p', 'swap'];

export default function HistoryPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [operationFilter, setOperationFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchHistory();
  }, [currencyFilter, operationFilter, page]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await ledgerApi.getHistory({
        currency: currencyFilter || undefined,
        operation: operationFilter || undefined,
        limit,
        offset: page * limit,
      });
      setEntries(response.data.entries || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">История операций</h1>
        <p className="text-muted-foreground">
          Все операции с вашими балансами
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Журнал операций</CardTitle>
              <CardDescription>Всего записей: {total}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Валюта" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все валюты</SelectItem>
                  {currencies.slice(1).map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
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
                  <SelectItem value="">Все операции</SelectItem>
                  {operations.slice(1).map((op) => (
                    <SelectItem key={op} value={op}>
                      {operationLabels[op]}
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
              Нет записей для отображения
            </p>
          ) : (
            <>
              <div className="space-y-4">
                {entries.map((entry) => (
                  <EntryRow key={entry.id} entry={entry} />
                ))}
              </div>

              {/* Pagination */}
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

function EntryRow({ entry }: { entry: LedgerEntry }) {
  const isPositive = entry.type === 'CREDIT' || entry.type === 'RELEASE';
  const icon = operationIcons[entry.operation] || <Filter className="h-5 w-5" />;
  const label = operationLabels[entry.operation] || entry.operation;
  const date = new Date(entry.createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isPositive
              ? 'bg-green-500/10 text-green-500'
              : 'bg-red-500/10 text-red-500'
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-medium ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {isPositive ? '+' : '-'}
          {formatAmount(entry.amount)} {entry.currency}
        </p>
        <p className="text-sm text-muted-foreground">
          Баланс: {formatAmount(entry.balanceAfter)}
        </p>
      </div>
    </div>
  );
}
