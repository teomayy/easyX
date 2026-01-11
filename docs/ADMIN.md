# EasyX Admin Panel Documentation

## Overview

Админ-панель EasyX для управления платформой, пользователями и транзакциями.

## Технологический стек

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **UI Components**: Shadcn/ui (Radix UI)
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Charts**: Recharts (опционально)

## Запуск

```bash
# Development
pnpm --filter @easyx/admin dev

# Production build
pnpm --filter @easyx/admin build

# Start production
pnpm --filter @easyx/admin start
```

Админ-панель доступна по адресу: **http://localhost:3002**

## Структура проекта

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── login/              # Страница входа
│   │   ├── (dashboard)/        # Защищенные страницы
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── users/          # Управление пользователями
│   │   │   ├── withdrawals/    # Одобрение выводов
│   │   │   ├── deposits/       # Мониторинг депозитов
│   │   │   ├── ledger/         # Журнал операций
│   │   │   └── settings/       # Настройки платформы
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # Shadcn/ui компоненты
│   │   └── providers.tsx
│   ├── lib/
│   │   ├── api.ts              # Admin API client
│   │   └── utils.ts
│   └── store/
│       └── auth.ts             # Admin auth store
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

## Страницы

| Путь | Описание |
|------|----------|
| `/login` | Страница входа для администраторов |
| `/` | Dashboard с метриками и статистикой |
| `/users` | Список пользователей, управление KYC |
| `/withdrawals` | Ожидающие выводы, одобрение/отклонение |
| `/deposits` | Мониторинг входящих депозитов |
| `/ledger` | Журнал всех операций с балансами |
| `/settings` | Настройки платформы |

## Функционал

### Dashboard
- Общая статистика (пользователи, депозиты, выводы, обмены)
- Оповещение о pending выводах
- Последние транзакции
- Графики активности

### Пользователи
- Список всех пользователей с фильтрацией
- Поиск по телефону, username, ID
- Фильтр по KYC статусу
- Изменение KYC статуса (NONE → VERIFIED → REJECTED)
- Детали пользователя

### Выводы
- Список ожидающих заявок
- Детали заявки (сумма, адрес, пользователь)
- Одобрение вывода
- Отклонение с указанием причины
- История обработанных выводов

### Депозиты
- Мониторинг всех депозитов
- Статус подтверждений
- Фильтр по статусу (PENDING, CONFIRMED, FAILED)
- Ссылки на blockchain explorer

### Ledger
- Полный журнал операций
- Фильтрация по пользователю, валюте, типу операции
- Типы записей: CREDIT, DEBIT, HOLD, RELEASE
- Баланс до/после каждой операции

### Настройки
- Маржа обмена
- Лимиты вывода (с KYC / без KYC)
- Комиссии вывода по сетям
- Количество подтверждений для депозитов

## API Endpoints

Admin API использует те же JWT токены, но проверяет роль администратора.

### Авторизация
```
POST /api/v1/admin/auth/login
```

### Dashboard
```
GET /api/v1/admin/dashboard
```

### Пользователи
```
GET  /api/v1/admin/users
GET  /api/v1/admin/users/:id
PATCH /api/v1/admin/users/:id/kyc
```

### Выводы
```
GET  /api/v1/admin/withdrawals/pending
POST /api/v1/admin/withdrawals/:id/approve
POST /api/v1/admin/withdrawals/:id/reject
```

### Депозиты
```
GET /api/v1/admin/deposits
```

### Ledger
```
GET /api/v1/admin/ledger
```

## Безопасность

- Отдельная аутентификация для админов (AdminUser)
- JWT токены хранятся в localStorage под ключом `adminAccessToken`
- Автоматический редирект на /login при истечении токена
- Проверка роли на каждом API запросе

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3005
```
