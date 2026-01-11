// Currency display names
export const CURRENCY_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  LTC: 'Litecoin',
  USDT_TRC20: 'USDT (TRC20)',
  USDT_ERC20: 'USDT (ERC20)',
  UZS: 'Uzbek Som',
};

// Currency symbols
export const CURRENCY_SYMBOLS: Record<string, string> = {
  BTC: '₿',
  LTC: 'Ł',
  USDT_TRC20: '$',
  USDT_ERC20: '$',
  UZS: "so'm",
};

// Network names
export const NETWORK_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  LTC: 'Litecoin',
  TRC20: 'TRON (TRC20)',
  ERC20: 'Ethereum (ERC20)',
};

// Decimal places for display
export const CURRENCY_DECIMALS: Record<string, number> = {
  BTC: 8,
  LTC: 8,
  USDT_TRC20: 2,
  USDT_ERC20: 2,
  UZS: 0,
};

// Minimum amounts
export const MIN_DEPOSIT: Record<string, string> = {
  BTC: '0.0001',
  LTC: '0.001',
  USDT_TRC20: '1',
  USDT_ERC20: '10',
};

export const MIN_WITHDRAWAL: Record<string, string> = {
  BTC: '0.001',
  LTC: '0.01',
  USDT_TRC20: '10',
  USDT_ERC20: '20',
};

// Required confirmations
export const REQUIRED_CONFIRMATIONS: Record<string, number> = {
  BTC: 3,
  LTC: 6,
  TRC20: 20,
  ERC20: 12,
};

// API error codes
export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  DUPLICATE_TRANSACTION: 'DUPLICATE_TRANSACTION',
  WITHDRAWAL_PENDING: 'WITHDRAWAL_PENDING',
  KYC_REQUIRED: 'KYC_REQUIRED',
} as const;
