import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, UserRole } from '@/types';
import { AUTH_STORAGE_KEY } from '@/constants';
import { isTokenExpired, parseAuthUser } from '@/utils/jwt';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  rememberMe: boolean;
  setAuth: (token: string, roles: string[], rememberMe?: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  isCompanyOrAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      rememberMe: true,

      setAuth: (token, roles, rememberMe = true) => {
        const user = parseAuthUser(token, roles);
        set({ token, user, rememberMe });
      },

      logout: () => set({ token: null, user: null }),

      isAuthenticated: () => {
        const { token } = get();
        if (!token) return false;
        return !isTokenExpired(token);
      },

      hasRole: (...roles) => {
        const { user } = get();
        if (!user) return false;
        return user.roles.some((r) => roles.includes(r));
      },

      isCompanyOrAdmin: () => {
        const { user } = get();
        if (!user) return false;
        return user.roles.includes('Admin') || user.roles.includes('Company');
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) =>
        state.rememberMe
          ? { token: state.token, user: state.user, rememberMe: state.rememberMe }
          : { rememberMe: state.rememberMe },
    },
  ),
);

interface ThemeState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
}));
