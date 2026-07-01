import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import type { UserRole } from '@/types';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

interface RoleGuardProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ roles, children, fallback }: RoleGuardProps) {
  const hasRole = useAuthStore((s) => s.hasRole(...roles));

  if (!hasRole) {
    return fallback ?? <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
