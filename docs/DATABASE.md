# EasyX Database Schema

## Overview

База данных PostgreSQL 15 с ORM Prisma.

## Tables

### User
Пользователи системы.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| phone | String? | Номер телефона (unique) |
| telegramId | String? | Telegram ID (unique) |
| username | String? | Username (unique) |
| password | String? | Bcrypt hash |
| kycStatus | KycStatus | NONE, PENDING, VERIFIED, REJECTED |
| isAdmin | Boolean | Флаг администратора |
| createdAt | DateTime | Дата создания |
| updatedAt | DateTime | Дата обновления |

**Indexes:** phone, telegramId, username

### Balance
Балансы пользователей. Одна запись на пару user+currency.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | FK to User |
| currency | Currency | Валюта |
| available | Decimal(36,18) | Доступный баланс |
| held | Decimal(36,18) | Замороженный баланс |
| createdAt | DateTime | Дата создания |
| updatedAt | DateTime | Дата обновления |

**Unique:** (userId, currency)

### LedgerEntry
Иммутабельный журнал всех операций с балансами.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | FK to User |
| currency | Currency | Валюта |
| amount | Decimal(36,18) | Сумма операции |
| type | EntryType | CREDIT, DEBIT, HOLD, RELEASE |
| operation | String | Тип операции (deposit, withdrawal, p2p, swap) |
| referenceId | String | ID связанной сущности |
| balanceBefore | Decimal(36,18) | Баланс до операции |
| balanceAfter | Decimal(36,18) | Баланс после операции |
| createdAt | DateTime | Дата создания |

**Indexes:** userId, operation, referenceId, createdAt

### WalletAddress
Депозитные адреса пользователей.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | FK to User |
| currency | Currency | Валюта |
| network | Network | Сеть (BTC, LTC, TRC20, ERC20) |
| address | String | Blockchain адрес (unique) |
| createdAt | DateTime | Дата создания |

**Indexes:** userId, address

### Deposit
Депозиты пользователей.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | FK to User |
| currency | Currency | Валюта |
| network | Network | Сеть |
| txHash | String | Hash транзакции (unique) |
| amount | Decimal(36,18) | Сумма |
| confirmations | Int | Количество подтверждений |
| status | DepositStatus | PENDING, CONFIRMED, FAILED |
| createdAt | DateTime | Дата создания |
| updatedAt | DateTime | Дата обновления |

**Indexes:** userId, status, txHash

### Withdrawal
Заявки на вывод.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | FK to User |
| currency | Currency | Валюта |
| network | Network | Сеть |
| address | String | Адрес получателя |
| amount | Decimal(36,18) | Сумма |
| fee | Decimal(36,18) | Комиссия |
| txHash | String? | Hash транзакции |
| status | WithdrawalStatus | PENDING, PROCESSING, COMPLETED, REJECTED, FAILED |
| createdAt | DateTime | Дата создания |
| updatedAt | DateTime | Дата обновления |

**Indexes:** userId, status

### P2pTransfer
P2P переводы между пользователями.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| fromUserId | String | FK to User (отправитель) |
| toUserId | String | FK to User (получатель) |
| currency | Currency | Валюта |
| amount | Decimal(36,18) | Сумма |
| note | String? | Комментарий |
| createdAt | DateTime | Дата создания |

**Indexes:** fromUserId, toUserId

### Trade
История обменов валют.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | FK to User |
| fromCurrency | Currency | Исходная валюта |
| toCurrency | Currency | Целевая валюта |
| fromAmount | Decimal(36,18) | Сумма исходной валюты |
| toAmount | Decimal(36,18) | Сумма целевой валюты |
| rate | Decimal(36,18) | Курс обмена |
| createdAt | DateTime | Дата создания |

**Indexes:** userId

### RiskFlag
Флаги риска для AML/Compliance.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | FK to User |
| type | String | Тип флага |
| severity | String | low, medium, high, critical |
| details | Json? | Детали |
| resolved | Boolean | Разрешен ли флаг |
| createdAt | DateTime | Дата создания |
| updatedAt | DateTime | Дата обновления |

**Indexes:** userId, resolved

### AdminUser
Администраторы системы (отдельно от пользователей).

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| email | String | Email (unique) |
| password | String | Bcrypt hash |
| name | String | Имя |
| role | String | admin, super_admin |
| createdAt | DateTime | Дата создания |
| updatedAt | DateTime | Дата обновления |

### SystemSetting
Системные настройки.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| key | String | Ключ (unique) |
| value | Json | Значение |
| updatedAt | DateTime | Дата обновления |

## Enums

### Currency
```
BTC         - Bitcoin
LTC         - Litecoin
USDT_TRC20  - USDT on TRON
USDT_ERC20  - USDT on Ethereum
UZS         - Uzbek Som
```

### Network
```
BTC    - Bitcoin network
LTC    - Litecoin network
TRC20  - TRON network
ERC20  - Ethereum network
```

### EntryType
```
CREDIT   - Зачисление на available
DEBIT    - Списание с available
HOLD     - Перенос из available в held
RELEASE  - Перенос из held (обычно с последующим DEBIT)
```

### KycStatus
```
NONE     - KYC не пройден
PENDING  - На проверке
VERIFIED - Подтвержден
REJECTED - Отклонен
```

### DepositStatus
```
PENDING   - Ожидает подтверждений
CONFIRMED - Подтвержден и зачислен
FAILED    - Ошибка
```

### WithdrawalStatus
```
PENDING    - Ожидает обработки
PROCESSING - Транзакция отправляется
COMPLETED  - Завершен
REJECTED   - Отклонен админом
FAILED     - Ошибка отправки
```

## ER Diagram

```
User (1) ──────< Balance (N)
  │
  │ (1)
  ├──────────< WalletAddress (N)
  │
  ├──────────< Deposit (N)
  │
  ├──────────< Withdrawal (N)
  │
  ├──────────< LedgerEntry (N)
  │
  ├──────────< Trade (N)
  │
  ├──────────< P2pTransfer (N) [as sender]
  │
  └──────────< P2pTransfer (N) [as receiver]
```

## Migrations

```bash
# Создание миграции
pnpm --filter @easyx/database migrate:dev -- --name migration_name

# Применение миграций (production)
pnpm --filter @easyx/database migrate:deploy

# Сброс базы (только dev!)
pnpm --filter @easyx/database db:push --force-reset
```

## Prisma Studio

```bash
# Запуск GUI для просмотра данных
pnpm db:studio
```

Доступно по адресу: http://localhost:5555
