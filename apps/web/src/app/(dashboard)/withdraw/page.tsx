'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle } from 'lucide-react';

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
import { ledgerApi, withdrawalApi } from '@/lib/api';
import { formatAmount, truncateAddress } from '@/lib/utils';

interface Balance {
  currency: string;
  available: string;
  held: string;
  total: string;
}

interface Fee {
  network: string;
  fee: string;
  min: string;
}

interface Withdrawal {
  id: string;
  currency: string;
  network: string;
  address: string;
  amount: string;
  fee: string;
  txHash: string | null;
  status: string;
  createdAt: string;
}

const networkMap: { [key: string]: string } = {
  BTC: 'BTC',
  LTC: 'LTC',
  USDT_TRC20: 'TRC20',
  USDT_ERC20: 'ERC20',
};

const withdrawSchema = z.object({
  currency: z.string().min(1, 'Выберите валюту'),
  address: z.string().min(1, 'Введите адрес'),
  amount: z.string().min(1, 'Введите сумму'),
});

type WithdrawFormData = z.infer<typeof withdrawSchema>;

export default function WithdrawPage() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [fees, setFees] = useState<{ [key: string]: Fee }>({});
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
  });

  const amount = watch('amount');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balancesRes, feesRes, withdrawalsRes] = await Promise.all([
          ledgerApi.getBalances(),
          withdrawalApi.getFees(),
          withdrawalApi.getWithdrawals({ limit: 10 }),
        ]);
        setBalances(balancesRes.data);
        setFees(feesRes.data);
        setWithdrawals(withdrawalsRes.data.withdrawals || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedBalance = balances.find((b) => b.currency === selectedCurrency);
  const selectedFee = selectedCurrency ? fees[networkMap[selectedCurrency]] : null;

  const calculateReceive = () => {
    if (!amount || !selectedFee) return '0';
    const amountNum = parseFloat(amount) || 0;
    const feeNum = parseFloat(selectedFee.fee) || 0;
    const receive = amountNum - feeNum;
    return receive > 0 ? formatAmount(receive.toFixed(8)) : '0';
  };

  const onSubmit = async (data: WithdrawFormData) => {
    if (!selectedFee) return;

    const amountNum = parseFloat(data.amount);
    const minAmount = parseFloat(selectedFee.min);

    if (amountNum < minAmount) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: `Минимальная сумма вывода: ${selectedFee.min}`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await withdrawalApi.create({
        currency: data.currency,
        network: networkMap[data.currency],
        address: data.address,
        amount: data.amount,
      });
      toast({
        title: 'Заявка создана',
        description: 'Ваша заявка на вывод принята в обработку',
      });
      reset();
      setSelectedCurrency('');
      // Refresh withdrawals list
      const withdrawalsRes = await withdrawalApi.getWithdrawals({ limit: 10 });
      setWithdrawals(withdrawalsRes.data.withdrawals || []);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Не удалось создать заявку';
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const setMaxAmount = () => {
    if (selectedBalance) {
      setValue('amount', selectedBalance.available);
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
        <h1 className="text-2xl font-bold">Вывод средств</h1>
        <p className="text-muted-foreground">
          Отправьте криптовалюту на внешний кошелек
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Создать заявку</CardTitle>
          <CardDescription>
            Заполните данные для вывода средств
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Currency Select */}
            <div className="space-y-2">
              <Label>Валюта</Label>
              <Select
                value={selectedCurrency}
                onValueChange={(value) => {
                  setSelectedCurrency(value);
                  setValue('currency', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите валюту" />
                </SelectTrigger>
                <SelectContent>
                  {balances.map((balance) => (
                    <SelectItem key={balance.currency} value={balance.currency}>
                      <div className="flex items-center justify-between gap-4">
                        <span>{balance.currency}</span>
                        <span className="text-muted-foreground">
                          {formatAmount(balance.available)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-sm text-destructive">
                  {errors.currency.message}
                </p>
              )}
            </div>

            {/* Address Input */}
            <div className="space-y-2">
              <Label>Адрес получателя</Label>
              <Input
                placeholder="Введите адрес кошелька"
                {...register('address')}
              />
              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Сумма</Label>
                {selectedBalance && (
                  <button
                    type="button"
                    onClick={setMaxAmount}
                    className="text-sm text-primary hover:underline"
                  >
                    Макс: {formatAmount(selectedBalance.available)}
                  </button>
                )}
              </div>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                {...register('amount')}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Fee Info */}
            {selectedFee && (
              <div className="space-y-3 rounded-lg bg-muted p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Комиссия сети</span>
                  <span>{selectedFee.fee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Мин. сумма</span>
                  <span>{selectedFee.min}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Получит получатель</span>
                  <span>{calculateReceive()}</span>
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="flex items-start gap-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-yellow-500" />
              <div className="text-sm">
                <p className="font-medium text-yellow-500">Внимание</p>
                <p className="text-muted-foreground">
                  Убедитесь, что адрес верный. Транзакции в блокчейне необратимы.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !selectedCurrency}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Создать заявку
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Withdrawals */}
      <Card>
        <CardHeader>
          <CardTitle>История выводов</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              У вас пока нет выводов
            </p>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      -{withdrawal.amount} {withdrawal.currency}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {truncateAddress(withdrawal.address)}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={withdrawal.status} />
                    <p className="text-sm text-muted-foreground">
                      Комиссия: {withdrawal.fee}
                    </p>
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

function StatusBadge({ status }: { status: string }) {
  const statusConfig: {
    [key: string]: { label: string; className: string };
  } = {
    PENDING: { label: 'Ожидание', className: 'bg-yellow-500/20 text-yellow-500' },
    PROCESSING: {
      label: 'Обработка',
      className: 'bg-blue-500/20 text-blue-500',
    },
    COMPLETED: {
      label: 'Завершен',
      className: 'bg-green-500/20 text-green-500',
    },
    REJECTED: { label: 'Отклонен', className: 'bg-red-500/20 text-red-500' },
    FAILED: { label: 'Ошибка', className: 'bg-red-500/20 text-red-500' },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
