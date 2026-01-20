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
      const token = localStorage.getItem('adminAccessToken');
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
    if (error.response?.status === 401) {
      // Clear all auth data to prevent redirect loop
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('admin-auth-storage');
      // Only redirect if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Admin Auth API
export const adminAuthApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/admin/auth/login', data),
};

// Admin Dashboard API
export const adminDashboardApi = {
  getStats: () => api.get('/admin/dashboard'),
};

// Admin Users API
export const adminUsersApi = {
  getUsers: (params?: {
    search?: string;
    kycStatus?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/admin/users', { params }),

  getUser: (id: string) => api.get(`/admin/users/${id}`),

  updateKycStatus: (id: string, status: string) =>
    api.patch(`/admin/users/${id}/kyc`, { status }),
};

// Admin Withdrawals API
export const adminWithdrawalsApi = {
  getPending: (params?: { limit?: number; offset?: number }) =>
    api.get('/admin/withdrawals/pending', { params }),

  approve: (id: string) => api.post(`/admin/withdrawals/${id}/approve`),

  reject: (id: string, reason: string) =>
    api.post(`/admin/withdrawals/${id}/reject`, { reason }),
};

// Admin Deposits API
export const adminDepositsApi = {
  getDeposits: (params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/admin/deposits', { params }),
};

// Admin Ledger API
export const adminLedgerApi = {
  getEntries: (params?: {
    userId?: string;
    currency?: string;
    operation?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/admin/ledger', { params }),
};

// Admin Wallets API
export const adminWalletsApi = {
  getBalances: () => api.get('/admin/wallets/balances'),

  getNodeStatuses: () => api.get('/admin/wallets/nodes'),

  getAddresses: (params?: {
    currency?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/admin/wallets/addresses', { params }),

  getAddressStats: () => api.get('/admin/wallets/addresses/stats'),

  sendCrypto: (data: {
    currency: string;
    network: string;
    toAddress: string;
    amount: string;
  }) => api.post('/admin/wallets/send', data),
};

export default api;
