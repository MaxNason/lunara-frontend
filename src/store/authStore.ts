import { create } from 'zustand';
import { authApi, type UserOut } from '../api/auth';

interface AuthState {
  token: string | null;
  user: UserOut | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.login(email, password);
      localStorage.setItem('token', data.access_token);
      set({ token: data.access_token, loading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.detail || 'Login failed', loading: false });
      throw e;
    }
  },

  register: async (email, password, full_name) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.register(email, password, full_name);
      localStorage.setItem('token', data.access_token);
      set({ token: data.access_token, loading: false });
    } catch (e: any) {
      set({ error: e.response?.data?.detail || 'Registration failed', loading: false });
      throw e;
    }
  },

  fetchUser: async () => {
    try {
      const { data } = await authApi.me();
      set({ user: data });
    } catch {
      set({ token: null, user: null });
      localStorage.removeItem('token');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  clearError: () => set({ error: null }),
}));
