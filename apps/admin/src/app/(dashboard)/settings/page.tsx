'use client';

import { useState } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';

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
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: 'Настройки сохранены',
      description: 'Изменения успешно применены',
    });
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">
          Конфигурация платформы
        </p>
      </div>

      {/* Exchange Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Настройки обмена
          </CardTitle>
          <CardDescription>
            Параметры курсов и комиссий
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Маржа обмена (%)</Label>
              <Input type="number" defaultValue="1.5" step="0.1" />
              <p className="text-sm text-muted-foreground">
                Надбавка к биржевому курсу
              </p>
            </div>
            <div className="space-y-2">
              <Label>Минимальный обмен (USD)</Label>
              <Input type="number" defaultValue="10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Лимиты вывода</CardTitle>
          <CardDescription>
            Ограничения для пользователей
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Дневной лимит без KYC (USD)</Label>
              <Input type="number" defaultValue="1000" />
            </div>
            <div className="space-y-2">
              <Label>Месячный лимит без KYC (USD)</Label>
              <Input type="number" defaultValue="5000" />
            </div>
            <div className="space-y-2">
              <Label>Дневной лимит с KYC (USD)</Label>
              <Input type="number" defaultValue="50000" />
            </div>
            <div className="space-y-2">
              <Label>Месячный лимит с KYC (USD)</Label>
              <Input type="number" defaultValue="500000" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Fees */}
      <Card>
        <CardHeader>
          <CardTitle>Комиссии вывода</CardTitle>
          <CardDescription>
            Сетевые комиссии для каждой валюты
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium">
              <div>Сеть</div>
              <div>Комиссия</div>
              <div>Мин. сумма</div>
              <div>Макс. сумма</div>
            </div>
            {[
              { network: 'BTC', fee: '0.0001', min: '0.001', max: '10' },
              { network: 'LTC', fee: '0.001', min: '0.01', max: '1000' },
              { network: 'TRC20', fee: '1', min: '10', max: '100000' },
              { network: 'ERC20', fee: '5', min: '20', max: '100000' },
            ].map((item) => (
              <div
                key={item.network}
                className="grid grid-cols-4 gap-4 items-center"
              >
                <div className="font-medium">{item.network}</div>
                <Input type="text" defaultValue={item.fee} />
                <Input type="text" defaultValue={item.min} />
                <Input type="text" defaultValue={item.max} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmations */}
      <Card>
        <CardHeader>
          <CardTitle>Подтверждения депозитов</CardTitle>
          <CardDescription>
            Количество подтверждений для зачисления
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { network: 'BTC', confirmations: '3' },
              { network: 'LTC', confirmations: '6' },
              { network: 'TRC20', confirmations: '20' },
              { network: 'ERC20', confirmations: '12' },
            ].map((item) => (
              <div key={item.network} className="space-y-2">
                <Label>{item.network}</Label>
                <Input type="number" defaultValue={item.confirmations} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Сохранить настройки
        </Button>
      </div>
    </div>
  );
}
