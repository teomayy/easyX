'use client';

import { useEffect, useState } from 'react';
import { Search, Loader2, Eye, Shield } from 'lucide-react';

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
import { useToast } from '@/components/ui/use-toast';
import { adminUsersApi } from '@/lib/api';

interface User {
  id: string;
  phone: string | null;
  username: string | null;
  telegramId: string | null;
  kycStatus: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  isAdmin: boolean;
  createdAt: string;
  _count?: {
    balances: number;
    deposits: number;
    withdrawals: number;
  };
}

const kycStatuses = ['all', 'NONE', 'PENDING', 'VERIFIED', 'REJECTED'];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const limit = 20;

  useEffect(() => {
    fetchUsers();
  }, [search, kycFilter, page]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminUsersApi.getUsers({
        search: search || undefined,
        kycStatus: kycFilter === 'all' ? undefined : kycFilter,
        limit,
        offset: page * limit,
      });
      setUsers(response.data.users || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Mock data for demo
      setUsers([
        {
          id: 'user1',
          phone: '+998901234567',
          username: 'john_doe',
          telegramId: null,
          kycStatus: 'VERIFIED',
          isAdmin: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user2',
          phone: '+998907654321',
          username: null,
          telegramId: '123456789',
          kycStatus: 'PENDING',
          isAdmin: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user3',
          phone: '+998909999999',
          username: 'alice',
          telegramId: null,
          kycStatus: 'NONE',
          isAdmin: false,
          createdAt: new Date().toISOString(),
        },
      ]);
      setTotal(3);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKycUpdate = async (userId: string, status: string) => {
    setIsUpdating(true);
    try {
      await adminUsersApi.updateKycStatus(userId, status);
      toast({
        title: 'Статус обновлен',
        description: `KYC статус изменен на ${status}`,
      });
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Пользователи</h1>
        <p className="text-muted-foreground">
          Управление пользователями платформы
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Список пользователей</CardTitle>
              <CardDescription>Всего: {total}</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
              <Select value={kycFilter} onValueChange={setKycFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="KYC" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  {kycStatuses.slice(1).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
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
          ) : users.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Пользователи не найдены
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium">ID</th>
                      <th className="pb-3 font-medium">Контакт</th>
                      <th className="pb-3 font-medium">Username</th>
                      <th className="pb-3 font-medium">KYC</th>
                      <th className="pb-3 font-medium">Дата</th>
                      <th className="pb-3 font-medium">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="py-3">
                          <code className="text-xs">{user.id.slice(0, 8)}...</code>
                        </td>
                        <td className="py-3">
                          {user.phone || user.telegramId || '-'}
                        </td>
                        <td className="py-3">{user.username || '-'}</td>
                        <td className="py-3">
                          <KycBadge status={user.kycStatus} />
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Пользователь
            </DialogTitle>
            <DialogDescription>
              Детали и управление KYC статусом
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p className="font-mono">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Телефон</p>
                  <p>{selectedUser.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Username</p>
                  <p>{selectedUser.username || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Telegram</p>
                  <p>{selectedUser.telegramId || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">KYC статус</p>
                  <KycBadge status={selectedUser.kycStatus} />
                </div>
                <div>
                  <p className="text-muted-foreground">Регистрация</p>
                  <p>
                    {new Date(selectedUser.createdAt).toLocaleDateString(
                      'ru-RU'
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Изменить KYC статус</p>
                <div className="flex gap-2">
                  {['NONE', 'PENDING', 'VERIFIED', 'REJECTED'].map((status) => (
                    <Button
                      key={status}
                      variant={
                        selectedUser.kycStatus === status
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => handleKycUpdate(selectedUser.id, status)}
                      disabled={
                        isUpdating || selectedUser.kycStatus === status
                      }
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KycBadge({ status }: { status: string }) {
  const statusConfig: {
    [key: string]: { label: string; className: string };
  } = {
    NONE: { label: 'Нет', className: 'bg-gray-500/20 text-gray-500' },
    PENDING: { label: 'На проверке', className: 'bg-yellow-500/20 text-yellow-500' },
    VERIFIED: { label: 'Подтвержден', className: 'bg-green-500/20 text-green-500' },
    REJECTED: { label: 'Отклонен', className: 'bg-red-500/20 text-red-500' },
  };

  const config = statusConfig[status] || statusConfig.NONE;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
