'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Wallet,
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  RefreshCw,
  History,
  User,
  LogOut,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Главная' },
  { href: '/deposit', icon: ArrowDownToLine, label: 'Пополнить' },
  { href: '/withdraw', icon: ArrowUpFromLine, label: 'Вывести' },
  { href: '/transfer', icon: Users, label: 'P2P перевод' },
  { href: '/swap', icon: RefreshCw, label: 'Обмен' },
  { href: '/history', icon: History, label: 'История' },
  { href: '/profile', icon: User, label: 'Профиль' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, logout, fetchProfile, user } = useAuthStore();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/login');
      return;
    }
    if (!user) {
      fetchProfile();
    }
  }, [router, fetchProfile, user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated && typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">EasyX</span>
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-muted-foreground">
                {user.username || user.phone}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container flex gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 md:block">
          <nav className="sticky top-24 space-y-1">
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
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 p-2 text-muted-foreground"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
