import { useAuthStore } from '@/store';
import type { UserRole } from '@/types';

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasRole = useAuthStore((s) => s.hasRole);
  const isCompanyOrAdmin = useAuthStore((s) => s.isCompanyOrAdmin);

  return { token, user, logout, isAuthenticated, hasRole, isCompanyOrAdmin };
}

export function useHasRole(...roles: UserRole[]): boolean {
  return useAuthStore((s) => s.hasRole(...roles));
}
