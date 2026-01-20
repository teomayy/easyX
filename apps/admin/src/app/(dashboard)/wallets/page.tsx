'use client';

import { useEffect, useState } from 'react';
import {
  Wallet,
  Server,
  RefreshCw,
  Loader2,
  Send,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { adminWalletsApi } from '@/lib/api';
import { formatAmount, truncateAddress } from '@/lib/utils';

interface WalletBalance {
  currency: string;
  network: string;
  balance: string;
  address?: string;
}

interface NodeStatus {
  currency: string;
  network: string;
  status: 'online' | 'offline' | 'syncing';
  blockHeight?: number;
  syncProgress?: number;
  peers?: number;
  version?: string;
}

interface WalletAddress {
  id: string;
  userId: string;
  currency: string;
  network: string;
  address: string;
  createdAt: string;
  user?: {
    id: string;
    phone: string | null;
    username: string | null;
  };
}

interface AddressStat {
  currency: string;
  network: string;
  count: number;
}

export default function WalletsPage() {
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [nodeStatuses, setNodeStatuses] = useState<NodeStatus[]>([]);
  const [addresses, setAddresses] = useState<WalletAddress[]>([]);
  const [addressStats, setAddressStats] = useState<AddressStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendForm, setSendForm] = useState({
    currency: '',
    network: '',
    toAddress: '',
    amount: '',
  });
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [balancesRes, nodesRes, addressesRes, statsRes] = await Promise.all([
        adminWalletsApi.getBalances(),
        adminWalletsApi.getNodeStatuses(),
        adminWalletsApi.getAddresses({ limit: 100 }),
        adminWalletsApi.getAddressStats(),
      ]);
      setBalances(balancesRes.data || []);
      setNodeStatuses(nodesRes.data || []);
      setAddresses(addressesRes.data.addresses || []);
      setAddressStats(statsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить данные кошельков',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    toast({
      title: 'Обновлено',
      description: 'Данные кошельков обновлены',
    });
  };

  const handleSend = async () => {
    if (!sendForm.currency || !sendForm.toAddress || !sendForm.amount) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните все поля',
      });
      return;
    }

    setIsSending(true);
    try {
      const result = await adminWalletsApi.sendCrypto(sendForm);
      toast({
        title: 'Отправлено',
        description: `TX: ${result.data.txHash}`,
      });
      setShowSendDialog(false);
      setSendForm({ currency: '', network: '', toAddress: '', amount: '' });
      fetchData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка отправки',
        description: 'Не удалось отправить криптовалюту',
      });
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано',
      description: 'Адрес скопирован в буфер обмена',
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Кошельки</h1>
          <p className="text-muted-foreground">
            Управление криптовалютными кошельками
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          <Button onClick={() => setShowSendDialog(true)}>
            <Send className="mr-2 h-4 w-4" />
            Отправить
          </Button>
        </div>
      </div>

      <Tabs defaultValue="balances">
        <TabsList>
          <TabsTrigger value="balances">Балансы</TabsTrigger>
          <TabsTrigger value="nodes">Ноды</TabsTrigger>
          <TabsTrigger value="addresses">Адреса</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {balances.map((balance, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Wallet className="h-5 w-5" />
                    {balance.currency}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({balance.network})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {balance.balance === 'N/A' ? (
                      <span className="text-muted-foreground">N/A</span>
                    ) : (
                      formatAmount(balance.balance)
                    )}
                  </p>
                  {balance.address && (
                    <div className="mt-2 flex items-center gap-2">
                      <code className="text-xs text-muted-foreground">
                        {truncateAddress(balance.address, 8)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(balance.address!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="nodes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {nodeStatuses.map((node, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      {node.currency} ({node.network})
                    </div>
                    <StatusBadge status={node.status} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Высота блока</p>
                      <p className="font-medium">
                        {node.blockHeight?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    {node.syncProgress !== undefined && node.syncProgress < 100 && (
                      <div>
                        <p className="text-muted-foreground">Синхронизация</p>
                        <p className="font-medium">{node.syncProgress.toFixed(2)}%</p>
                      </div>
                    )}
                    {node.peers !== undefined && (
                      <div>
                        <p className="text-muted-foreground">Пиры</p>
                        <p className="font-medium">{node.peers}</p>
                      </div>
                    )}
                    {node.version && (
                      <div>
                        <p className="text-muted-foreground">Версия</p>
                        <p className="font-medium text-xs">{node.version}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          {/* Address Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            {addressStats.map((stat, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.currency} ({stat.network})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-xs text-muted-foreground">адресов</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Addresses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Сгенерированные адреса</CardTitle>
              <CardDescription>
                Всего: {addresses.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Адреса не найдены
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 font-medium">Пользователь</th>
                        <th className="pb-3 font-medium">Валюта</th>
                        <th className="pb-3 font-medium">Сеть</th>
                        <th className="pb-3 font-medium">Адрес</th>
                        <th className="pb-3 font-medium">Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addresses.slice(0, 50).map((addr) => (
                        <tr key={addr.id} className="border-b">
                          <td className="py-3">
                            {addr.user?.username || addr.user?.phone || addr.userId.slice(0, 8)}
                          </td>
                          <td className="py-3">{addr.currency}</td>
                          <td className="py-3">{addr.network}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              <code className="text-xs">
                                {truncateAddress(addr.address, 10)}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(addr.address)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {new Date(addr.createdAt).toLocaleDateString('ru-RU')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Crypto Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отправить криптовалюту</DialogTitle>
            <DialogDescription>
              Отправка с мастер-кошелька
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Валюта</label>
                <Select
                  value={sendForm.currency}
                  onValueChange={(v) => {
                    setSendForm({ ...sendForm, currency: v, network: v });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="LTC">LTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Сумма</label>
                <Input
                  type="number"
                  step="0.00000001"
                  placeholder="0.00"
                  value={sendForm.amount}
                  onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Адрес получателя</label>
              <Input
                placeholder="Введите адрес"
                value={sendForm.toAddress}
                onChange={(e) => setSendForm({ ...sendForm, toAddress: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Отправить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: 'online' | 'offline' | 'syncing' }) {
  const config = {
    online: {
      icon: CheckCircle,
      label: 'Online',
      className: 'bg-green-500/20 text-green-500',
    },
    offline: {
      icon: XCircle,
      label: 'Offline',
      className: 'bg-red-500/20 text-red-500',
    },
    syncing: {
      icon: AlertTriangle,
      label: 'Syncing',
      className: 'bg-yellow-500/20 text-yellow-500',
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
