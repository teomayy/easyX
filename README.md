# EasyX - Криптообменная платформа

Криптообменная платформа с внутренним офчейн-балансом и P2P переводами.

## Технологический стек

### Backend
- **Framework**: NestJS 10 (TypeScript)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: Prisma 6
- **Auth**: JWT + Passport
- **API Docs**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **UI Components**: Shadcn/ui (Radix UI)
- **State**: Zustand + React Query
- **Forms**: React Hook Form + Zod

## Структура проекта

```
easyX/
├── apps/
│   ├── api/                    # NestJS Backend API
│   ├── web/                    # Next.js User App
│   └── admin/                  # Next.js Admin Panel
├── packages/
│   ├── database/               # Prisma schema + migrations
│   └── shared/                 # Shared types, utils, constants
├── docker/
│   ├── docker-compose.yml      # Development environment
│   └── docker-compose.prod.yml # Production environment
├── .env.example                # Environment variables template
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # PNPM workspace configuration
└── package.json                # Root package.json
```

## Быстрый старт

### Требования
- Node.js >= 20
- PNPM >= 9
- Docker & Docker Compose

### Установка

```bash
# Клонирование репозитория
git clone <repo-url>
cd easyX

# Установка зависимостей
pnpm install

# Копирование конфигурации
cp .env.example .env
cp .env apps/api/.env
cp .env packages/database/.env

# Запуск инфраструктуры (PostgreSQL + Redis)
docker compose -f docker/docker-compose.yml up -d

# Генерация Prisma Client
pnpm db:generate

# Применение схемы к базе данных
pnpm db:push

# Запуск API в режиме разработки
pnpm --filter @easyx/api dev

# Запуск Web App в режиме разработки
pnpm --filter @easyx/web dev

# Запуск Admin Panel в режиме разработки
pnpm --filter @easyx/admin dev
```

### Доступные команды

```bash
# Разработка
pnpm dev                       # Запуск всех приложений
pnpm --filter @easyx/api dev   # Запуск только API (порт 3005)
pnpm --filter @easyx/web dev   # Запуск только Web (порт 3001)
pnpm --filter @easyx/admin dev # Запуск только Admin (порт 3002)

# Сборка
pnpm build                     # Сборка всех пакетов
pnpm --filter @easyx/api build   # Сборка только API
pnpm --filter @easyx/web build   # Сборка только Web
pnpm --filter @easyx/admin build # Сборка только Admin

# База данных
pnpm db:generate            # Генерация Prisma Client
pnpm db:push                # Применение схемы (dev)
pnpm db:migrate             # Создание миграции
pnpm db:studio              # Prisma Studio GUI

# Тесты
pnpm test                   # Запуск всех тестов
pnpm --filter @easyx/api test  # Тесты API
```

## Конфигурация

### Переменные окружения (.env)

```bash
# Application
NODE_ENV=development
PORT=3005

# Database
DATABASE_URL=postgresql://easyx:easyx_dev_password@localhost:5433/easyx

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Blockchain nodes
BTC_RPC_URL=http://localhost:8332
LTC_RPC_URL=http://localhost:9332
TRON_FULL_NODE_URL=https://api.trongrid.io
ETH_RPC_URL=http://localhost:8545

# Exchange
EXCHANGE_MARGIN_PERCENT=1.5

# Limits
DAILY_WITHDRAW_NO_KYC=1000
DAILY_WITHDRAW_KYC=50000
```

## API документация

После запуска API, Swagger документация доступна по адресу:
```
http://localhost:3005/docs
```

### Основные эндпоинты

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| POST | /api/v1/auth/register | Регистрация | - |
| POST | /api/v1/auth/login | Авторизация | - |
| POST | /api/v1/auth/refresh | Обновление токена | - |
| POST | /api/v1/auth/telegram | Telegram Login | - |
| GET | /api/v1/user/profile | Профиль пользователя | JWT |
| PATCH | /api/v1/user/profile | Обновление профиля | JWT |
| GET | /api/v1/ledger/balances | Балансы пользователя | JWT |
| GET | /api/v1/ledger/history | История операций | JWT |
| GET | /api/v1/wallet/addresses | Все адреса | JWT |
| GET | /api/v1/wallet/address/:network | Получить адрес | JWT |
| POST | /api/v1/wallet/address/:network | Создать адрес | JWT |
| GET | /api/v1/deposits | История депозитов | JWT |
| POST | /api/v1/withdrawals | Создать вывод | JWT |
| GET | /api/v1/withdrawals | История выводов | JWT |
| GET | /api/v1/withdrawals/fees | Комиссии за вывод | JWT |
| POST | /api/v1/p2p/transfer | P2P перевод | JWT |
| GET | /api/v1/p2p/transfers | История переводов | JWT |
| GET | /api/v1/exchange/rates | Курсы обмена | - |
| GET | /api/v1/exchange/quote | Котировка обмена | - |
| POST | /api/v1/exchange/swap | Выполнить обмен | JWT |
| GET | /api/v1/exchange/trades | История обменов | JWT |
| GET | /api/v1/health | Health check | - |

### Admin API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/v1/admin/dashboard | Статистика |
| GET | /api/v1/admin/users | Список пользователей |
| GET | /api/v1/admin/users/:id | Детали пользователя |
| PATCH | /api/v1/admin/users/:id/kyc | Обновить KYC статус |
| GET | /api/v1/admin/withdrawals/pending | Ожидающие выводы |
| POST | /api/v1/admin/withdrawals/:id/approve | Одобрить вывод |
| POST | /api/v1/admin/withdrawals/:id/reject | Отклонить вывод |
| GET | /api/v1/admin/ledger | Журнал операций |

## Архитектура

### Модули NestJS

```
src/modules/
├── auth/           # Аутентификация (JWT, Telegram)
├── user/           # Управление пользователями
├── ledger/         # Балансы и журнал операций
├── wallet/         # Генерация адресов
├── deposit/        # Обработка депозитов
├── withdrawal/     # Обработка выводов
├── p2p/            # P2P переводы
├── exchange/       # Обмен валют
├── admin/          # Админ-панель API
└── health/         # Health checks
```

### Схема базы данных

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────<│   Balance   │     │ LedgerEntry │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       │            ┌─────────────┐           │
       ├───────────<│   Deposit   │───────────┤
       │            └─────────────┘           │
       │                                       │
       │            ┌─────────────┐           │
       ├───────────<│ Withdrawal  │───────────┤
       │            └─────────────┘           │
       │                                       │
       │            ┌─────────────┐           │
       ├───────────<│    Trade    │───────────┤
       │            └─────────────┘           │
       │                                       │
       │            ┌─────────────┐           │
       └───────────<│ P2pTransfer │───────────┘
                    └─────────────┘
```

## Поддерживаемые валюты

| Код | Название | Сеть |
|-----|----------|------|
| BTC | Bitcoin | Bitcoin |
| LTC | Litecoin | Litecoin |
| USDT_TRC20 | USDT | TRON (TRC20) |
| USDT_ERC20 | USDT | Ethereum (ERC20) |
| UZS | Uzbek Som | Fiat |

## Лицензия

Private - All rights reserved
