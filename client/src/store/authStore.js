import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.login(credentials);
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.register(userData);
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
      },

      logout: async () => {
        try { await authService.logout(); } catch {}
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.updateProfile(profileData);
          set({ user: data.user, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, message: error.response?.data?.message || 'Update failed' };
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) { set({ isAuthenticated: false, user: null }); return; }
        try {
          const { data } = await authService.getMe();
          set({ user: data.user, isAuthenticated: true, token });
        } catch {
          localStorage.removeItem('token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
