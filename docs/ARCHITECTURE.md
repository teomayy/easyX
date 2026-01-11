# EasyX Architecture

## Обзор системы

EasyX - криптообменная платформа с офчейн-балансами. Все переводы внутри системы происходят мгновенно без blockchain комиссий.

```
┌─────────────────────────────────────────────────────────────┐
│                      КЛИЕНТЫ                                 │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Web App       │   Admin Panel   │   Mobile App (future)   │
│   (Next.js)     │   (Next.js)     │                         │
└────────┬────────┴────────┬────────┴─────────────────────────┘
         │                 │
         ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY                               │
│                    (NestJS)                                  │
├─────────────────────────────────────────────────────────────┤
│  Auth  │  User  │  Ledger  │  Wallet  │  Exchange  │  Admin │
└────────┴────────┴────┬─────┴──────────┴────────────┴────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ PostgreSQL  │ │    Redis    │ │  Blockchain │
│  (Ledger)   │ │   (Cache)   │ │   Nodes     │
└─────────────┘ └─────────────┘ └─────────────┘
```

## Модули системы

### 1. Auth Module
Отвечает за аутентификацию и авторизацию пользователей.

**Компоненты:**
- `AuthController` - REST endpoints
- `AuthService` - бизнес-логика аутентификации
- `JwtStrategy` - Passport стратегия для JWT
- `JwtAuthGuard` - защита роутов

**Функции:**
- Регистрация по телефону
- Авторизация по паролю
- Telegram Login Widget
- JWT токены (access + refresh)

**Файлы:**
```
src/modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   └── jwt.strategy.ts
├── guards/
│   └── jwt-auth.guard.ts
├── decorators/
│   ├── public.decorator.ts
│   └── current-user.decorator.ts
└── dto/
    ├── register.dto.ts
    ├── login.dto.ts
    └── refresh-token.dto.ts
```

### 2. User Module
Управление профилями пользователей.

**Файлы:**
```
src/modules/user/
├── user.module.ts
├── user.controller.ts
├── user.service.ts
└── dto/
    └── update-profile.dto.ts
```

### 3. Ledger Module (Критический)
Ядро системы офчейн-балансов. Реализует двойную запись.

**Принципы:**
- ACID транзакции
- Иммутабельный журнал операций
- Hold/Release механизм для выводов
- Кэширование балансов в Redis

**Типы операций:**
- `CREDIT` - зачисление на баланс
- `DEBIT` - списание с баланса
- `HOLD` - заморозка средств
- `RELEASE` - разморозка средств

**Файлы:**
```
src/modules/ledger/
├── ledger.module.ts
├── ledger.controller.ts
├── ledger.service.ts      # Операции с журналом
├── balance.service.ts     # Работа с балансами
└── dto/
    └── get-history.dto.ts
```

**Пример операции перевода:**
```typescript
// P2P перевод 100 USDT от user1 к user2
await ledgerService.transfer({
  fromUserId: 'user1',
  toUserId: 'user2',
  currency: Currency.USDT_TRC20,
  amount: new Decimal('100'),
  operation: 'p2p',
  referenceId: transferId
});

// Создаются 2 записи в журнале:
// 1. DEBIT user1: -100 USDT
// 2. CREDIT user2: +100 USDT
```

### 4. Wallet Module
Генерация депозитных адресов.

**Поддерживаемые сети:**
- BTC (SegWit)
- LTC (SegWit)
- TRC20 (TRON)
- ERC20 (Ethereum)

**Файлы:**
```
src/modules/wallet/
├── wallet.module.ts
├── wallet.controller.ts
└── wallet.service.ts
```

### 5. Deposit Module
Обработка входящих депозитов.

**Процесс:**
1. Watcher обнаруживает транзакцию на адрес пользователя
2. Создается запись Deposit со статусом PENDING
3. При достижении N подтверждений вызывается `confirmDeposit`
4. Средства зачисляются через `ledgerService.credit`

**Файлы:**
```
src/modules/deposit/
├── deposit.module.ts
├── deposit.controller.ts
├── deposit.service.ts
└── dto/
    └── get-deposits.dto.ts
```

### 6. Withdrawal Module
Обработка выводов средств.

**Процесс:**
1. Пользователь создает заявку на вывод
2. Проверяются лимиты и баланс
3. Средства замораживаются через `ledgerService.hold`
4. Админ одобряет/отклоняет вывод
5. При одобрении отправляется blockchain транзакция
6. Средства списываются через `ledgerService.release` + `debit`

**Статусы вывода:**
- `PENDING` - ожидает обработки
- `PROCESSING` - отправляется транзакция
- `COMPLETED` - успешно завершен
- `REJECTED` - отклонен админом
- `FAILED` - ошибка отправки

**Файлы:**
```
src/modules/withdrawal/
├── withdrawal.module.ts
├── withdrawal.controller.ts
├── withdrawal.service.ts
└── dto/
    ├── create-withdrawal.dto.ts
    └── get-withdrawals.dto.ts
```

### 7. P2P Module
Мгновенные переводы между пользователями.

**Особенности:**
- Комиссия: 0
- Скорость: мгновенно
- Поиск по username/phone/userId

**Файлы:**
```
src/modules/p2p/
├── p2p.module.ts
├── p2p.controller.ts
├── p2p.service.ts
└── dto/
    ├── create-transfer.dto.ts
    └── get-transfers.dto.ts
```

### 8. Exchange Module
Обмен валют внутри системы.

**Компоненты:**
- `ExchangeService` - выполнение обменов
- `RatesService` - получение курсов (Binance API)

**Особенности:**
- Автообновление курсов каждую минуту
- Настраиваемая маржа (по умолчанию 1.5%)
- Кросс-курсы через USD

**Файлы:**
```
src/modules/exchange/
├── exchange.module.ts
├── exchange.controller.ts
├── exchange.service.ts
├── rates.service.ts
└── dto/
    ├── create-swap.dto.ts
    ├── get-quote.dto.ts
    └── get-trades.dto.ts
```

### 9. Admin Module
API для админ-панели.

**Функции:**
- Dashboard со статистикой
- Управление пользователями
- Просмотр ledger
- Одобрение/отклонение выводов
- Управление KYC

**Файлы:**
```
src/modules/admin/
├── admin.module.ts
├── admin.controller.ts
├── admin.service.ts
├── guards/
│   └── admin.guard.ts
└── dto/
    ├── get-users.dto.ts
    └── process-withdrawal.dto.ts
```

## База данных

### Схема Prisma

Полная схема находится в `packages/database/prisma/schema.prisma`

### Основные таблицы

**User** - пользователи системы
```prisma
model User {
  id         String    @id @default(cuid())
  phone      String?   @unique
  telegramId String?   @unique
  username   String?   @unique
  password   String?
  kycStatus  KycStatus @default(NONE)
  isAdmin    Boolean   @default(false)
}
```

**Balance** - балансы пользователей
```prisma
model Balance {
  id        String   @id @default(cuid())
  userId    String
  currency  Currency
  available Decimal  @db.Decimal(36, 18)
  held      Decimal  @db.Decimal(36, 18)

  @@unique([userId, currency])
}
```

**LedgerEntry** - журнал операций (иммутабельный)
```prisma
model LedgerEntry {
  id            String    @id @default(cuid())
  userId        String
  currency      Currency
  amount        Decimal   @db.Decimal(36, 18)
  type          EntryType // CREDIT, DEBIT, HOLD, RELEASE
  operation     String    // deposit, withdrawal, p2p, swap
  referenceId   String
  balanceBefore Decimal
  balanceAfter  Decimal
  createdAt     DateTime  @default(now())
}
```

### Enum типы

```prisma
enum Currency {
  BTC
  LTC
  USDT_TRC20
  USDT_ERC20
  UZS
}

enum Network {
  BTC
  LTC
  TRC20
  ERC20
}

enum EntryType {
  CREDIT
  DEBIT
  HOLD
  RELEASE
}

enum KycStatus {
  NONE
  PENDING
  VERIFIED
  REJECTED
}

enum DepositStatus {
  PENDING
  CONFIRMED
  FAILED
}

enum WithdrawalStatus {
  PENDING
  PROCESSING
  COMPLETED
  REJECTED
  FAILED
}
```

## Безопасность

### Аутентификация
- JWT токены с коротким временем жизни (15 мин)
- Refresh токены для продления сессии (7 дней)
- Bcrypt для хеширования паролей (cost factor: 12)

### Защита API
- Rate limiting (100 req/min)
- CORS настройки
- Валидация входных данных (class-validator)
- Guard'ы для защиты роутов

### Финансовая безопасность
- ACID транзакции для операций с балансами
- Double-entry bookkeeping (двойная запись)
- Лимиты на вывод (KYC/non-KYC)
- Ручное одобрение крупных выводов

## Масштабирование

### Текущая архитектура (Monolith)
- Простота развертывания
- Подходит для MVP

### Будущее масштабирование (Microservices)
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Auth Service│ │Ledger Service│ │Wallet Service│
└─────────────┘ └─────────────┘ └─────────────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
               ┌───────▼───────┐
               │  Message Bus   │
               │  (RabbitMQ)    │
               └───────────────┘
```

### Рекомендации
- Redis кластер для кэширования
- Read replicas для PostgreSQL
- Kubernetes для оркестрации
- Message queue для асинхронных операций
