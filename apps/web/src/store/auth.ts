import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, userApi } from '@/lib/api';

export interface User {
  id: string;
  phone: string | null;
  username: string | null;
  telegramId: string | null;
  kycStatus: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (phone: string, password: string) => Promise<void>;
  register: (
    phone: string,
    password: string,
    username?: string
  ) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (phone: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ phone, password });
          const { user, accessToken, refreshToken } = response.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (phone: string, password: string, username?: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register({ phone, password, username });
          const { user, accessToken, refreshToken } = response.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      fetchProfile: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        set({ isLoading: true });
        try {
          const response = await userApi.getProfile();
          set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch {
          set({ isLoading: false });
          get().logout();
        }
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
