'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  LayoutDashboard,
  Users,
  ArrowUpFromLine,
  ArrowDownToLine,
  FileText,
  Settings,
  LogOut,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAdminAuthStore } from '@/store/auth';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/users', icon: Users, label: 'Пользователи' },
  { href: '/withdrawals', icon: ArrowUpFromLine, label: 'Выводы' },
  { href: '/deposits', icon: ArrowDownToLine, label: 'Депозиты' },
  { href: '/ledger', icon: FileText, label: 'Ledger' },
  { href: '/settings', icon: Settings, label: 'Настройки' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, logout, admin, _hasHydrated } = useAdminAuthStore();

  useEffect(() => {
    // Only check auth after hydration is complete
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Show loading while hydrating
  if (!_hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // After hydration, check if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">EasyX Admin</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="border-t p-4">
            <div className="mb-2 text-sm">
              <p className="font-medium">{admin?.name || 'Admin'}</p>
              <p className="text-muted-foreground">{admin?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen p-8">{children}</main>
    </div>
  );
}
