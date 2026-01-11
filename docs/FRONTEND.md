# EasyX Frontend Documentation

## Overview

Web-приложение EasyX построено на Next.js 14 с использованием App Router.

## Технологический стек

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **UI Components**: Shadcn/ui (Radix UI)
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

## Структура проекта

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, register)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/        # Protected pages
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── deposit/        # Deposit page
│   │   │   ├── withdraw/       # Withdrawal page
│   │   │   ├── transfer/       # P2P transfer page
│   │   │   ├── swap/           # Exchange page
│   │   │   ├── history/        # Transaction history
│   │   │   └── profile/        # User profile
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   └── use-toast.ts
│   │   └── providers.tsx       # React Query provider
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   └── utils.ts            # Utility functions
│   └── store/
│       └── auth.ts             # Auth store (Zustand)
├── public/                     # Static files
├── next.config.mjs             # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
└── package.json
```

## Запуск

```bash
# Development
pnpm --filter @easyx/web dev

# Production build
pnpm --filter @easyx/web build

# Start production
pnpm --filter @easyx/web start
```

## Страницы

### Public Pages

| Путь | Описание |
|------|----------|
| `/` | Landing page |
| `/login` | Страница входа |
| `/register` | Страница регистрации |

### Protected Pages (требуют авторизации)

| Путь | Описание |
|------|----------|
| `/dashboard` | Главная страница с балансами |
| `/deposit` | Пополнение кошелька |
| `/withdraw` | Вывод средств |
| `/transfer` | P2P переводы |
| `/swap` | Обмен валют |
| `/history` | История операций |
| `/profile` | Профиль пользователя |

## Компоненты

### UI Components (Shadcn/ui)

Все UI компоненты находятся в `src/components/ui/` и основаны на Radix UI с кастомными стилями Tailwind.

- **Button** - кнопки разных вариантов (default, outline, ghost, etc.)
- **Card** - карточки для группировки контента
- **Input** - поля ввода
- **Label** - метки для форм
- **Select** - выпадающие списки
- **Tabs** - табы для навигации
- **Dialog** - модальные окна
- **Toast** - уведомления

### Использование toast

```tsx
import { useToast } from '@/components/ui/use-toast';

function MyComponent() {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: 'Успех',
      description: 'Операция выполнена',
    });
  };
}
```

## API Client

API client (`src/lib/api.ts`) предоставляет функции для работы с backend:

```typescript
import { ledgerApi, exchangeApi, p2pApi } from '@/lib/api';

// Get balances
const balances = await ledgerApi.getBalances();

// Get exchange rates
const rates = await exchangeApi.getRates();

// Create P2P transfer
await p2pApi.transfer({
  recipient: 'username',
  currency: 'USDT_TRC20',
  amount: '100',
});
```

### Доступные API модули

- `authApi` - регистрация, логин, refresh token
- `userApi` - профиль пользователя
- `ledgerApi` - балансы и история операций
- `walletApi` - депозитные адреса
- `depositApi` - депозиты
- `withdrawalApi` - выводы
- `p2pApi` - P2P переводы
- `exchangeApi` - курсы и обмен

## State Management

### Auth Store (Zustand)

```typescript
import { useAuthStore } from '@/store/auth';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuthStore();

  // Login
  await login('+998901234567', 'password');

  // Logout
  logout();
}
```

## Темная тема

Приложение использует темную тему по умолчанию. Цвета настроены в `globals.css` через CSS переменные:

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3005
```

## Responsive Design

Приложение адаптивно для мобильных устройств:
- Desktop: Sidebar навигация
- Mobile: Bottom navigation bar

## Security

- JWT токены хранятся в localStorage
- Автоматический refresh token при истечении access token
- Protected routes проверяют наличие токена

## Form Validation

Все формы используют React Hook Form с Zod для валидации:

```typescript
const schema = z.object({
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Неверный формат'),
  password: z.string().min(8, 'Минимум 8 символов'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```
