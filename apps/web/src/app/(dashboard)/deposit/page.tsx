'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Loader2, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { walletApi, depositApi } from '@/lib/api';
import { truncateAddress } from '@/lib/utils';

interface WalletAddress {
  id: string;
  network: string;
  currency: string;
  address: string;
  createdAt: string;
}

interface Deposit {
  id: string;
  currency: string;
  network: string;
  txHash: string;
  amount: string;
  confirmations: number;
  status: string;
  createdAt: string;
}

const networks = [
  { id: 'BTC', name: 'Bitcoin', currency: 'BTC', confirmations: 3 },
  { id: 'LTC', name: 'Litecoin', currency: 'LTC', confirmations: 6 },
  { id: 'TRC20', name: 'TRON (TRC20)', currency: 'USDT_TRC20', confirmations: 20 },
  { id: 'ERC20', name: 'Ethereum (ERC20)', currency: 'USDT_ERC20', confirmations: 12 },
];

export default function DepositPage() {
  const [selectedNetwork, setSelectedNetwork] = useState('BTC');
  const [addresses, setAddresses] = useState<{ [key: string]: WalletAddress }>({});
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAddresses();
    fetchDeposits();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await walletApi.getAddresses();
      const addressMap: { [key: string]: WalletAddress } = {};
      response.data.forEach((addr: WalletAddress) => {
        addressMap[addr.network] = addr;
      });
      setAddresses(addressMap);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeposits = async () => {
    try {
      const response = await depositApi.getDeposits({ limit: 10 });
      setDeposits(response.data.deposits || []);
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
    }
  };

  const generateAddress = async (network: string) => {
    setIsGenerating(true);
    try {
      const response = await walletApi.getAddress(network);
      setAddresses((prev) => ({
        ...prev,
        [network]: response.data,
      }));
      toast({
        title: 'Адрес создан',
        description: 'Депозитный адрес успешно сгенерирован',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось создать адрес',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast({
      title: 'Скопировано',
      description: 'Адрес скопирован в буфер обмена',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const currentNetwork = networks.find((n) => n.id === selectedNetwork);
  const currentAddress = addresses[selectedNetwork];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Пополнение</h1>
        <p className="text-muted-foreground">
          Получите криптовалюту на свой кошелек
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Выберите сеть</CardTitle>
          <CardDescription>
            Отправляйте средства только в указанной сети
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedNetwork} onValueChange={setSelectedNetwork}>
            <TabsList className="grid w-full grid-cols-4">
              {networks.map((network) => (
                <TabsTrigger key={network.id} value={network.id}>
                  {network.id}
                </TabsTrigger>
              ))}
            </TabsList>

            {networks.map((network) => (
              <TabsContent key={network.id} value={network.id}>
                <div className="mt-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : addresses[network.id] ? (
                    <div className="space-y-6">
                      {/* QR Code */}
                      <div className="flex justify-center">
                        <div className="rounded-lg bg-white p-4">
                          <QRCodeSVG
                            value={addresses[network.id].address}
                            size={200}
                            level="H"
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Адрес для пополнения
                        </label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 rounded-lg bg-muted p-3 text-sm break-all">
                            {addresses[network.id].address}
                          </code>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              copyAddress(addresses[network.id].address)
                            }
                          >
                            {copied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Warning */}
                      <div className="flex items-start gap-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                        <AlertCircle className="h-5 w-5 shrink-0 text-yellow-500" />
                        <div className="text-sm">
                          <p className="font-medium text-yellow-500">Внимание</p>
                          <p className="text-muted-foreground">
                            Отправляйте только {network.currency} в сети{' '}
                            {network.name}. Отправка других монет или использование
                            другой сети приведет к потере средств.
                          </p>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                          Минимальная сумма:{' '}
                          {network.id === 'BTC'
                            ? '0.0001 BTC'
                            : network.id === 'LTC'
                              ? '0.001 LTC'
                              : '10 USDT'}
                        </p>
                        <p>Необходимо подтверждений: {network.confirmations}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="mb-4 text-muted-foreground">
                        У вас еще нет адреса для {network.name}
                      </p>
                      <Button
                        onClick={() => generateAddress(network.id)}
                        disabled={isGenerating}
                      >
                        {isGenerating && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Создать адрес
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Deposits */}
      <Card>
        <CardHeader>
          <CardTitle>Последние депозиты</CardTitle>
        </CardHeader>
        <CardContent>
          {deposits.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              У вас пока нет депозитов
            </p>
          ) : (
            <div className="space-y-4">
              {deposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      +{deposit.amount} {deposit.currency}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {truncateAddress(deposit.txHash)}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={deposit.status} />
                    <p className="text-sm text-muted-foreground">
                      {deposit.confirmations} подтверждений
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
    CONFIRMED: { label: 'Подтвержден', className: 'bg-green-500/20 text-green-500' },
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
