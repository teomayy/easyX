'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Users, ArrowRight } from 'lucide-react';

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
import { ledgerApi, p2pApi } from '@/lib/api';
import { formatAmount } from '@/lib/utils';

interface Balance {
  currency: string;
  available: string;
  held: string;
  total: string;
}

interface Transfer {
  id: string;
  fromUser: { id: string; username: string | null };
  toUser: { id: string; username: string | null };
  currency: string;
  amount: string;
  note: string | null;
  direction: 'sent' | 'received';
  createdAt: string;
}

const transferSchema = z.object({
  recipient: z.string().min(1, 'Введите получателя'),
  currency: z.string().min(1, 'Выберите валюту'),
  amount: z
    .string()
    .min(1, 'Введите сумму')
    .refine((val) => parseFloat(val) > 0, 'Сумма должна быть больше 0'),
  note: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

export default function TransferPage() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
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
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balancesRes, transfersRes] = await Promise.all([
          ledgerApi.getBalances(),
          p2pApi.getTransfers({ limit: 10 }),
        ]);
        setBalances(balancesRes.data);
        setTransfers(transfersRes.data.transfers || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedBalance = balances.find((b) => b.currency === selectedCurrency);

  const onSubmit = async (data: TransferFormData) => {
    if (!selectedBalance) return;

    const amountNum = parseFloat(data.amount);
    const availableNum = parseFloat(selectedBalance.available);

    if (amountNum > availableNum) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Недостаточно средств',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await p2pApi.transfer({
        recipient: data.recipient,
        currency: data.currency,
        amount: data.amount,
        note: data.note,
      });
      toast({
        title: 'Перевод выполнен',
        description: `${data.amount} ${data.currency} отправлено`,
      });
      reset();
      setSelectedCurrency('');
      // Refresh data
      const [balancesRes, transfersRes] = await Promise.all([
        ledgerApi.getBalances(),
        p2pApi.getTransfers({ limit: 10 }),
      ]);
      setBalances(balancesRes.data);
      setTransfers(transfersRes.data.transfers || []);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Не удалось выполнить перевод';
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
        <h1 className="text-2xl font-bold">P2P перевод</h1>
        <p className="text-muted-foreground">
          Мгновенные переводы другим пользователям без комиссии
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Новый перевод
          </CardTitle>
          <CardDescription>
            Отправьте средства по username, номеру телефона или ID пользователя
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Recipient */}
            <div className="space-y-2">
              <Label>Получатель</Label>
              <Input
                placeholder="Username, телефон или ID"
                {...register('recipient')}
              />
              {errors.recipient && (
                <p className="text-sm text-destructive">
                  {errors.recipient.message}
                </p>
              )}
            </div>

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

            {/* Note */}
            <div className="space-y-2">
              <Label>Комментарий (необязательно)</Label>
              <Input
                placeholder="За услуги, подарок и т.д."
                {...register('note')}
              />
            </div>

            {/* Info */}
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <p>Комиссия: 0 (бесплатно)</p>
              <p>Скорость: мгновенно</p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !selectedCurrency}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Отправить
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Transfer History */}
      <Card>
        <CardHeader>
          <CardTitle>История переводов</CardTitle>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              У вас пока нет переводов
            </p>
          ) : (
            <div className="space-y-4">
              {transfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        transfer.direction === 'sent'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-green-500/10 text-green-500'
                      }`}
                    >
                      <ArrowRight
                        className={`h-5 w-5 ${
                          transfer.direction === 'sent' ? '' : 'rotate-180'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium">
                        {transfer.direction === 'sent' ? 'Отправлено' : 'Получено'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transfer.direction === 'sent'
                          ? transfer.toUser.username || 'Пользователь'
                          : transfer.fromUser.username || 'Пользователь'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        transfer.direction === 'sent'
                          ? 'text-red-500'
                          : 'text-green-500'
                      }`}
                    >
                      {transfer.direction === 'sent' ? '-' : '+'}
                      {transfer.amount} {transfer.currency}
                    </p>
                    {transfer.note && (
                      <p className="text-sm text-muted-foreground">
                        {transfer.note}
                      </p>
                    )}
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
