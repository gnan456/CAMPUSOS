import { create } from 'zustand';
import type { User, Role } from '@/types';
import { authApi } from '@/services/auth.api';
import { setAccessToken } from '@/lib/api-client';

/**
 * Auth store — manages authentication state globally.
 *
 * Why Zustand over Context:
 * - No provider nesting required
 * - Re-renders only components that subscribe to changed fields
 * - Can be used outside React components (e.g., in API interceptors)
 */

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    const { user } = await authApi.login({ email, password });
    set({ user, isAuthenticated: true });
  },

  register: async (name, email, password) => {
    const { user } = await authApi.register({
      name,
      email,
      password,
    });
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false });
    }
  },

  /**
   * Attempt to restore the session on app load.
   * Calls /auth/refresh (uses httpOnly cookie) to get a new access token.
   * If it fails, the user is simply not authenticated (not an error).
   */
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const { user } = await authApi.refreshToken();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
