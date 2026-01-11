import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Wallet,
  RefreshCw,
  Users,
  Shield,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">EasyX</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Войти</Button>
            </Link>
            <Link href="/register">
              <Button>Регистрация</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Криптообменная платформа
            <br />
            <span className="text-primary">нового поколения</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Мгновенные P2P переводы, обмен криптовалют и вывод средств.
            Безопасно, быстро, удобно.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Начать сейчас
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Войти в аккаунт
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Wallet className="h-10 w-10" />}
            title="Мультивалютный кошелек"
            description="BTC, LTC, USDT TRC20/ERC20 и UZS в одном месте"
          />
          <FeatureCard
            icon={<RefreshCw className="h-10 w-10" />}
            title="Мгновенный обмен"
            description="Обменивайте криптовалюты по лучшим курсам"
          />
          <FeatureCard
            icon={<Users className="h-10 w-10" />}
            title="P2P переводы"
            description="Мгновенные переводы другим пользователям без комиссии"
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10" />}
            title="Безопасность"
            description="Двухфакторная аутентификация и холодное хранение"
          />
        </div>

        {/* Supported Currencies */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl font-bold">Поддерживаемые валюты</h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            <CurrencyBadge name="Bitcoin" symbol="BTC" />
            <CurrencyBadge name="Litecoin" symbol="LTC" />
            <CurrencyBadge name="USDT" symbol="TRC20" />
            <CurrencyBadge name="USDT" symbol="ERC20" />
            <CurrencyBadge name="Uzbek Som" symbol="UZS" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-32 border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              <span className="font-bold">EasyX</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 EasyX. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function CurrencyBadge({ name, symbol }: { name: string; symbol: string }) {
  return (
    <div className="flex items-center gap-3 rounded-full border bg-card px-6 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {symbol.slice(0, 2)}
      </div>
      <div className="text-left">
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted-foreground">{symbol}</div>
      </div>
    </div>
  );
}
