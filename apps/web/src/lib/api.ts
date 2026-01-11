import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { phone: string; password: string; username?: string }) =>
    api.post('/auth/register', data),

  login: (data: { phone: string; password: string }) =>
    api.post('/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),

  telegramLogin: (data: {
    id: number;
    first_name: string;
    username?: string;
    auth_date: number;
    hash: string;
  }) => api.post('/auth/telegram', data),
};

// User API
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: { username?: string }) =>
    api.patch('/user/profile', data),
};

// Ledger API
export const ledgerApi = {
  getBalances: () => api.get('/ledger/balances'),
  getHistory: (params?: {
    currency?: string;
    operation?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/ledger/history', { params }),
};

// Wallet API
export const walletApi = {
  getAddresses: () => api.get('/wallet/addresses'),
  getAddress: (network: string) => api.get(`/wallet/address/${network}`),
  createAddress: (network: string) => api.post(`/wallet/address/${network}`),
};

// Deposit API
export const depositApi = {
  getDeposits: (params?: {
    currency?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/deposits', { params }),
};

// Withdrawal API
export const withdrawalApi = {
  create: (data: {
    currency: string;
    network: string;
    address: string;
    amount: string;
  }) => api.post('/withdrawals', data),

  getWithdrawals: (params?: {
    currency?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/withdrawals', { params }),

  getFees: () => api.get('/withdrawals/fees'),
};

// P2P API
export const p2pApi = {
  transfer: (data: {
    recipient: string;
    currency: string;
    amount: string;
    note?: string;
  }) => api.post('/p2p/transfer', data),

  getTransfers: (params?: {
    currency?: string;
    direction?: 'sent' | 'received' | 'all';
    limit?: number;
    offset?: number;
  }) => api.get('/p2p/transfers', { params }),
};

// Exchange API
export const exchangeApi = {
  getRates: () => api.get('/exchange/rates'),

  getQuote: (params: {
    fromCurrency: string;
    toCurrency: string;
    amount: string;
  }) => api.get('/exchange/quote', { params }),

  swap: (data: {
    fromCurrency: string;
    toCurrency: string;
    fromAmount: string;
  }) => api.post('/exchange/swap', data),

  getTrades: (params?: { limit?: number; offset?: number }) =>
    api.get('/exchange/trades', { params }),
};

export default api;
