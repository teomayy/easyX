'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Shield,
  Smartphone,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

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
import { useAuthStore } from '@/store/auth';
import { userApi } from '@/lib/api';

const profileSchema = z.object({
  username: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z0-9_]{3,20}$/.test(val),
      'Username должен содержать 3-20 символов (буквы, цифры, _)'
    ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, fetchProfile } = useAuthStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      await userApi.updateProfile({ username: data.username });
      await fetchProfile();
      toast({
        title: 'Профиль обновлен',
        description: 'Ваши данные успешно сохранены',
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Не удалось обновить профиль';
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const kycStatusConfig = {
    NONE: {
      icon: <XCircle className="h-5 w-5" />,
      label: 'Не пройден',
      className: 'text-muted-foreground',
      description: 'Пройдите верификацию для увеличения лимитов',
    },
    PENDING: {
      icon: <Clock className="h-5 w-5" />,
      label: 'На проверке',
      className: 'text-yellow-500',
      description: 'Ваши документы проверяются',
    },
    VERIFIED: {
      icon: <CheckCircle className="h-5 w-5" />,
      label: 'Подтвержден',
      className: 'text-green-500',
      description: 'Полный доступ к платформе',
    },
    REJECTED: {
      icon: <XCircle className="h-5 w-5" />,
      label: 'Отклонен',
      className: 'text-red-500',
      description: 'Попробуйте загрузить документы снова',
    },
  };

  const kycStatus = user?.kycStatus || 'NONE';
  const kycConfig = kycStatusConfig[kycStatus as keyof typeof kycStatusConfig];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Профиль</h1>
        <p className="text-muted-foreground">Управление аккаунтом</p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Личные данные
          </CardTitle>
          <CardDescription>Основная информация о вашем аккаунте</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>ID пользователя</Label>
              <Input value={user?.id || ''} disabled />
              <p className="text-sm text-muted-foreground">
                Уникальный идентификатор для P2P переводов
              </p>
            </div>

            <div className="space-y-2">
              <Label>Телефон</Label>
              <Input value={user?.phone || 'Не указан'} disabled />
            </div>

            {user?.telegramId && (
              <div className="space-y-2">
                <Label>Telegram ID</Label>
                <Input value={user.telegramId} disabled />
              </div>
            )}

            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                placeholder="Введите username"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Другие пользователи смогут отправлять вам переводы по этому имени
              </p>
            </div>

            <div className="space-y-2">
              <Label>Дата регистрации</Label>
              <Input
                value={
                  user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('ru-RU')
                    : ''
                }
                disabled
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Сохранить изменения
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* KYC Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Верификация (KYC)
          </CardTitle>
          <CardDescription>
            Статус проверки личности
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-muted ${kycConfig.className}`}
            >
              {kycConfig.icon}
            </div>
            <div>
              <p className={`font-medium ${kycConfig.className}`}>
                {kycConfig.label}
              </p>
              <p className="text-sm text-muted-foreground">
                {kycConfig.description}
              </p>
            </div>
          </div>

          {kycStatus === 'NONE' && (
            <div className="mt-6">
              <h4 className="mb-4 font-medium">Преимущества верификации:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Лимит вывода: до $50,000 в день
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Лимит вывода: до $500,000 в месяц
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Приоритетная поддержка
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Ускоренная обработка выводов
                </li>
              </ul>
              <Button className="mt-4" disabled>
                Пройти верификацию (скоро)
              </Button>
            </div>
          )}

          {kycStatus === 'NONE' && (
            <div className="mt-6 rounded-lg bg-muted p-4">
              <h4 className="font-medium">Текущие лимиты без KYC:</h4>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Дневной лимит вывода: $1,000</li>
                <li>Месячный лимит вывода: $5,000</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Безопасность
          </CardTitle>
          <CardDescription>Настройки безопасности аккаунта</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Смена пароля</p>
              <p className="text-sm text-muted-foreground">
                Рекомендуется менять пароль каждые 3 месяца
              </p>
            </div>
            <Button variant="outline" disabled>
              Изменить
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Двухфакторная аутентификация</p>
              <p className="text-sm text-muted-foreground">
                Дополнительная защита аккаунта
              </p>
            </div>
            <Button variant="outline" disabled>
              Включить (скоро)
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Telegram уведомления</p>
              <p className="text-sm text-muted-foreground">
                Получайте уведомления о транзакциях
              </p>
            </div>
            <Button variant="outline" disabled>
              Настроить (скоро)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
