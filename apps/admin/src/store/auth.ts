import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { adminAuthApi } from '@/lib/api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

interface AdminAuthState {
  admin: AdminUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await adminAuthApi.login({ email, password });
          const { admin, accessToken } = response.data;

          localStorage.setItem('adminAccessToken', accessToken);

          set({
            admin,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('adminAccessToken');
        set({
          admin: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
