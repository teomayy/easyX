'use client';

import { useEffect, useState } from 'react';
import { Loader2, Check, X, AlertTriangle, ExternalLink } from 'lucide-react';

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { adminWithdrawalsApi } from '@/lib/api';
import { formatAmount, truncateAddress } from '@/lib/utils';

interface Withdrawal {
  id: string;
  userId: string;
  currency: string;
  network: string;
  address: string;
  amount: string;
  fee: string;
  txHash: string | null;
  status: string;
  createdAt: string;
  user?: {
    phone: string | null;
    username: string | null;
  };
}

export default function WithdrawalsPage() {
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingWithdrawals();
  }, []);

  const fetchPendingWithdrawals = async () => {
    setIsLoading(true);
    try {
      const response = await adminWithdrawalsApi.getPending({ limit: 50 });
      setPendingWithdrawals(response.data.withdrawals || []);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
      // Mock data for demo
      setPendingWithdrawals([
        {
          id: 'w1',
          userId: 'user1',
          currency: 'BTC',
          network: 'BTC',
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          amount: '0.5',
          fee: '0.0001',
          txHash: null,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          user: { phone: '+998901234567', username: 'john_doe' },
        },
        {
          id: 'w2',
          userId: 'user2',
          currency: 'USDT_TRC20',
          network: 'TRC20',
          address: 'TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          amount: '1000',
          fee: '1',
          txHash: null,
          status: 'PENDING',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          user: { phone: '+998907654321', username: null },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await adminWithdrawalsApi.approve(id);
      toast({
        title: 'Вывод одобрен',
        description: 'Заявка отправлена на обработку',
      });
      fetchPendingWithdrawals();
      setSelectedWithdrawal(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось одобрить вывод',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Укажите причину отклонения',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await adminWithdrawalsApi.reject(id, rejectReason);
      toast({
        title: 'Вывод отклонен',
        description: 'Средства возвращены на баланс пользователя',
      });
      fetchPendingWithdrawals();
      setSelectedWithdrawal(null);
      setRejectReason('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось отклонить вывод',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Заявки на вывод</h1>
        <p className="text-muted-foreground">
          Одобрение и отклонение заявок на вывод средств
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Ожидающие ({pendingWithdrawals.length})
          </TabsTrigger>
          <TabsTrigger value="processed">Обработанные</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Ожидают обработки
              </CardTitle>
              <CardDescription>
                Проверьте детали и примите решение
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pendingWithdrawals.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">
                  Нет ожидающих заявок
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingWithdrawals.map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatAmount(withdrawal.amount)}{' '}
                            {withdrawal.currency}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({withdrawal.network})
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {withdrawal.user?.username ||
                            withdrawal.user?.phone ||
                            withdrawal.userId}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {truncateAddress(withdrawal.address, 10)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(withdrawal.createdAt).toLocaleString(
                            'ru-RU'
                          )}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedWithdrawal(withdrawal)}
                        >
                          Просмотр
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Обработанные заявки</CardTitle>
              <CardDescription>История обработанных выводов</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="py-12 text-center text-muted-foreground">
                История пока пуста
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Withdrawal Detail Dialog */}
      <Dialog
        open={!!selectedWithdrawal}
        onOpenChange={() => {
          setSelectedWithdrawal(null);
          setRejectReason('');
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Детали заявки на вывод</DialogTitle>
            <DialogDescription>
              Проверьте информацию и примите решение
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Сумма</p>
                  <p className="text-lg font-bold">
                    {formatAmount(selectedWithdrawal.amount)}{' '}
                    {selectedWithdrawal.currency}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Комиссия</p>
                  <p>{selectedWithdrawal.fee}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Сеть</p>
                  <p>{selectedWithdrawal.network}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Пользователь</p>
                  <p>
                    {selectedWithdrawal.user?.username ||
                      selectedWithdrawal.user?.phone ||
                      selectedWithdrawal.userId}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Адрес получателя</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted p-2 text-xs break-all">
                    {selectedWithdrawal.address}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      window.open(
                        `https://www.blockchain.com/explorer/addresses/${selectedWithdrawal.network.toLowerCase()}/${selectedWithdrawal.address}`,
                        '_blank'
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Причина отклонения (если отклоняете)
                </p>
                <Input
                  placeholder="Например: Подозрительная активность"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() =>
                selectedWithdrawal && handleReject(selectedWithdrawal.id)
              }
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Отклонить
            </Button>
            <Button
              onClick={() =>
                selectedWithdrawal && handleApprove(selectedWithdrawal.id)
              }
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Одобрить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
