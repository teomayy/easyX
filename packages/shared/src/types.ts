// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// Auth
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  phone?: string;
  username?: string;
  telegramId?: string;
  kycStatus: string;
}

// Balance
export interface BalanceInfo {
  currency: string;
  available: string;
  held: string;
  total: string;
}

// Transaction history
export interface TransactionHistoryItem {
  id: string;
  type: 'deposit' | 'withdrawal' | 'p2p' | 'swap';
  currency: string;
  amount: string;
  status: string;
  createdAt: string;
  details?: Record<string, unknown>;
}

// Deposit
export interface DepositAddress {
  network: string;
  currency: string;
  address: string;
  qrCode?: string;
}

export interface DepositInfo {
  id: string;
  currency: string;
  network: string;
  txHash: string;
  amount: string;
  confirmations: number;
  status: string;
  createdAt: string;
}

// Withdrawal
export interface WithdrawalRequest {
  currency: string;
  network: string;
  address: string;
  amount: string;
}

export interface WithdrawalInfo {
  id: string;
  currency: string;
  network: string;
  address: string;
  amount: string;
  fee: string;
  txHash?: string;
  status: string;
  createdAt: string;
}

export interface WithdrawalFee {
  network: string;
  fee: string;
  min: string;
}

// P2P
export interface P2pTransferRequest {
  recipient: string;
  currency: string;
  amount: string;
  note?: string;
}

export interface P2pTransferInfo {
  id: string;
  fromUser: { id: string; username?: string };
  toUser: { id: string; username?: string };
  currency: string;
  amount: string;
  note?: string;
  direction: 'sent' | 'received';
  createdAt: string;
}

// Exchange
export interface SwapQuote {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  rate: string;
  expiresAt: string;
}

export interface SwapRequest {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
}

export interface TradeInfo {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  rate: string;
  createdAt: string;
}

// Rates
export interface ExchangeRates {
  rates: Record<string, Record<string, string>>;
  marginPercent: number;
  updatedAt: string;
}
