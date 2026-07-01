import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleGuard } from '@/components/common/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Loader } from '@/components/ui/Loader';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const ItemsPage = lazy(() => import('@/pages/items/ItemsPage'));
const SuppliersPage = lazy(() => import('@/pages/suppliers/SuppliersPage'));
const PurchaseOrdersPage = lazy(() => import('@/pages/purchaseOrders/PurchaseOrdersPage'));
const ArrivalsPage = lazy(() => import('@/pages/arrivals/ArrivalsPage'));
const ParametersPage = lazy(() => import('@/pages/parameters/ParametersPage'));
const FirstFreeNumbersPage = lazy(() => import('@/pages/firstFreeNumbers/FirstFreeNumbersPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <LazyPage>
        <LoginPage />
      </LazyPage>
    ),
  },
  {
    path: '/register',
    element: (
      <LazyPage>
        <RegisterPage />
      </LazyPage>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          {
            path: 'dashboard',
            element: (
              <LazyPage>
                <DashboardPage />
              </LazyPage>
            ),
          },
          {
            path: 'items',
            element: (
              <LazyPage>
                <ItemsPage />
              </LazyPage>
            ),
          },
          {
            path: 'suppliers',
            element: (
              <LazyPage>
                <RoleGuard roles={['Admin', 'Company']}>
                  <SuppliersPage />
                </RoleGuard>
              </LazyPage>
            ),
          },
          {
            path: 'purchase-orders',
            element: (
              <LazyPage>
                <PurchaseOrdersPage />
              </LazyPage>
            ),
          },
          {
            path: 'arrivals',
            element: (
              <LazyPage>
                <ArrivalsPage />
              </LazyPage>
            ),
          },
          {
            path: 'parameters',
            element: (
              <LazyPage>
                <RoleGuard roles={['Admin', 'Company']}>
                  <ParametersPage />
                </RoleGuard>
              </LazyPage>
            ),
          },
          {
            path: 'first-free-numbers',
            element: (
              <LazyPage>
                <RoleGuard roles={['Admin', 'Company']}>
                  <FirstFreeNumbersPage />
                </RoleGuard>
              </LazyPage>
            ),
          },
          {
            path: 'profile',
            element: (
              <LazyPage>
                <ProfilePage />
              </LazyPage>
            ),
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
