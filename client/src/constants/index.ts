import type { UserRole } from '@/types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export const ROLES = {
  ADMIN: 'Admin' as UserRole,
  COMPANY: 'Company' as UserRole,
  SUPPLIER: 'Supplier' as UserRole,
} as const;

export const ORDER_STATUS_LABELS: Record<number, string> = {
  1: 'Order Entry',
  2: 'Order Delivery',
  3: 'Delivered',
};

export const PACKING_TYPE_LABELS: Record<number, string> = {
  0: 'No',
  1: 'Yes',
};

export const DEFAULT_PAGE_SIZE = 10;

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'MdDashboard', roles: ['Admin', 'Company', 'Supplier'] as UserRole[] },
  { label: 'Items', path: '/items', icon: 'MdInventory2', roles: ['Admin', 'Company', 'Supplier'] as UserRole[] },
  { label: 'Suppliers', path: '/suppliers', icon: 'MdBusiness', roles: ['Admin', 'Company'] as UserRole[] },
  { label: 'Purchase Orders', path: '/purchase-orders', icon: 'MdShoppingCart', roles: ['Admin', 'Company', 'Supplier'] as UserRole[] },
  { label: 'Arrivals', path: '/arrivals', icon: 'MdLocalShipping', roles: ['Admin', 'Company', 'Supplier'] as UserRole[] },
  { label: 'Parameters', path: '/parameters', icon: 'MdSettings', roles: ['Admin', 'Company'] as UserRole[] },
  { label: 'First Free Numbers', path: '/first-free-numbers', icon: 'MdNumbers', roles: ['Admin', 'Company'] as UserRole[] },
  { label: 'Profile', path: '/profile', icon: 'MdPerson', roles: ['Admin', 'Company', 'Supplier'] as UserRole[] },
];

export const AUTH_STORAGE_KEY = 'poes-auth';
