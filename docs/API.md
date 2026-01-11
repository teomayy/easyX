# EasyX API Documentation

## Base URL
```
http://localhost:3005/api/v1
```

## Authentication

API использует JWT Bearer токены для аутентификации.

### Получение токена
```bash
POST /auth/login
Content-Type: application/json

{
  "phone": "+998901234567",
  "password": "SecurePassword123"
}
```

### Использование токена
```bash
Authorization: Bearer <access_token>
```

### Обновление токена
```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

---

## Auth Module

### POST /auth/register
Регистрация нового пользователя.

**Request:**
```json
{
  "phone": "+998901234567",
  "password": "SecurePassword123",
  "username": "john_doe"  // optional
}
```

**Response (201):**
```json
{
  "user": {
    "id": "clxxxxxxxxx",
    "phone": "+998901234567",
    "username": "john_doe"
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

### POST /auth/login
Авторизация по телефону и паролю.

**Request:**
```json
{
  "phone": "+998901234567",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "clxxxxxxxxx",
    "phone": "+998901234567",
    "username": "john_doe"
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

### POST /auth/telegram
Авторизация через Telegram Login Widget.

**Request:**
```json
{
  "id": 123456789,
  "first_name": "John",
  "username": "john_doe",
  "auth_date": 1234567890,
  "hash": "abc123..."
}
```

---

## User Module

### GET /user/profile
Получение профиля текущего пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "clxxxxxxxxx",
  "phone": "+998901234567",
  "username": "john_doe",
  "telegramId": null,
  "kycStatus": "NONE",
  "createdAt": "2026-01-10T12:00:00.000Z"
}
```

### PATCH /user/profile
Обновление профиля.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "username": "new_username"
}
```

---

## Ledger Module

### GET /ledger/balances
Получение всех балансов пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "currency": "BTC",
    "available": "0.5",
    "held": "0.1",
    "total": "0.6"
  },
  {
    "currency": "USDT_TRC20",
    "available": "1000.00",
    "held": "0",
    "total": "1000.00"
  }
]
```

### GET /ledger/history
История операций с балансом.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `currency` (optional) - фильтр по валюте
- `operation` (optional) - фильтр по типу операции (deposit, withdrawal, p2p, swap)
- `limit` (optional, default: 50, max: 100)
- `offset` (optional, default: 0)

**Response (200):**
```json
{
  "entries": [
    {
      "id": "clxxxxxxxxx",
      "userId": "clxxxxxxxxx",
      "currency": "BTC",
      "amount": "0.01",
      "type": "CREDIT",
      "operation": "deposit",
      "referenceId": "clxxxxxxxxx",
      "balanceBefore": "0.49",
      "balanceAfter": "0.50",
      "createdAt": "2026-01-10T12:00:00.000Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

---

## Wallet Module

### GET /wallet/addresses
Получение всех депозитных адресов пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "clxxxxxxxxx",
    "network": "BTC",
    "currency": "BTC",
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "createdAt": "2026-01-10T12:00:00.000Z"
  }
]
```

### GET /wallet/address/:network
Получение или создание адреса для указанной сети.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `network` - BTC, LTC, TRC20, ERC20

**Response (200):**
```json
{
  "id": "clxxxxxxxxx",
  "network": "TRC20",
  "currency": "USDT_TRC20",
  "address": "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "createdAt": "2026-01-10T12:00:00.000Z"
}
```

### POST /wallet/address/:network
Создание нового адреса для указанной сети.

---

## Deposit Module

### GET /deposits
История депозитов пользователя.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `currency` (optional)
- `status` (optional) - PENDING, CONFIRMED, FAILED
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Response (200):**
```json
{
  "deposits": [
    {
      "id": "clxxxxxxxxx",
      "userId": "clxxxxxxxxx",
      "currency": "BTC",
      "network": "BTC",
      "txHash": "abc123...",
      "amount": "0.01",
      "confirmations": 3,
      "status": "CONFIRMED",
      "createdAt": "2026-01-10T12:00:00.000Z"
    }
  ],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

---

## Withdrawal Module

### POST /withdrawals
Создание заявки на вывод.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "currency": "BTC",
  "network": "BTC",
  "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "amount": "0.01"
}
```

**Response (201):**
```json
{
  "id": "clxxxxxxxxx",
  "userId": "clxxxxxxxxx",
  "currency": "BTC",
  "network": "BTC",
  "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "amount": "0.01",
  "fee": "0.0001",
  "status": "PENDING",
  "createdAt": "2026-01-10T12:00:00.000Z"
}
```

### GET /withdrawals
История выводов.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `currency` (optional)
- `status` (optional) - PENDING, PROCESSING, COMPLETED, REJECTED, FAILED
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

### GET /withdrawals/fees
Получение комиссий и минимальных сумм вывода.

**Response (200):**
```json
{
  "BTC": { "network": "BTC", "fee": "0.0001", "min": "0.001" },
  "LTC": { "network": "LTC", "fee": "0.001", "min": "0.01" },
  "TRC20": { "network": "TRC20", "fee": "1", "min": "10" },
  "ERC20": { "network": "ERC20", "fee": "5", "min": "20" }
}
```

---

## P2P Module

### POST /p2p/transfer
Создание P2P перевода другому пользователю.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "recipient": "john_doe",  // username, phone, or userId
  "currency": "USDT_TRC20",
  "amount": "100",
  "note": "Payment for services"  // optional
}
```

**Response (201):**
```json
{
  "id": "clxxxxxxxxx",
  "toUser": {
    "id": "clxxxxxxxxx",
    "username": "john_doe"
  },
  "currency": "USDT_TRC20",
  "amount": "100",
  "note": "Payment for services",
  "createdAt": "2026-01-10T12:00:00.000Z"
}
```

### GET /p2p/transfers
История P2P переводов.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `currency` (optional)
- `direction` (optional) - sent, received, all
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Response (200):**
```json
{
  "transfers": [
    {
      "id": "clxxxxxxxxx",
      "fromUser": { "id": "...", "username": "sender" },
      "toUser": { "id": "...", "username": "receiver" },
      "currency": "USDT_TRC20",
      "amount": "100",
      "note": "Payment",
      "direction": "sent",
      "createdAt": "2026-01-10T12:00:00.000Z"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

---

## Exchange Module

### GET /exchange/rates
Получение всех курсов обмена.

**Response (200):**
```json
{
  "rates": {
    "BTC": {
      "LTC": "600.5",
      "USDT_TRC20": "42000.00",
      "USDT_ERC20": "42000.00",
      "UZS": "525000000"
    },
    "USDT_TRC20": {
      "BTC": "0.0000238",
      "LTC": "0.0143",
      "UZS": "12500"
    }
  },
  "marginPercent": 1.5,
  "updatedAt": "2026-01-10T12:00:00.000Z"
}
```

### GET /exchange/quote
Получение котировки для обмена.

**Query Parameters:**
- `fromCurrency` - исходная валюта
- `toCurrency` - целевая валюта
- `amount` - сумма для обмена

**Response (200):**
```json
{
  "fromCurrency": "BTC",
  "toCurrency": "USDT_TRC20",
  "fromAmount": "0.01",
  "toAmount": "420.00",
  "rate": "42000.00",
  "expiresAt": "2026-01-10T12:00:30.000Z"
}
```

### POST /exchange/swap
Выполнение обмена валют.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "fromCurrency": "BTC",
  "toCurrency": "USDT_TRC20",
  "fromAmount": "0.01"
}
```

**Response (201):**
```json
{
  "id": "clxxxxxxxxx",
  "fromCurrency": "BTC",
  "toCurrency": "USDT_TRC20",
  "fromAmount": "0.01",
  "toAmount": "420.00",
  "rate": "42000.00",
  "createdAt": "2026-01-10T12:00:00.000Z"
}
```

### GET /exchange/trades
История обменов пользователя.

**Headers:** `Authorization: Bearer <token>`

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["phone must be a valid phone number"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Admin access required",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User with this phone already exists",
  "error": "Conflict"
}
```

### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```
