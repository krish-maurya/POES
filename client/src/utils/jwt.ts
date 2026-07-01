import type { AuthUser, UserRole } from '@/types';

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const EMAIL_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/emailaddress';
const ID_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier';

interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

export function decodeJwt(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const decoded = atob(payload);
  return JSON.parse(decoded) as JwtPayload;
}

export function getTokenExpiry(token: string): number | null {
  try {
    const payload = decodeJwt(token);
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return Date.now() >= expiry;
}

function extractRoles(payload: JwtPayload): UserRole[] {
  const roleValue = payload[ROLE_CLAIM] ?? payload.role;
  if (!roleValue) return [];
  const roles = Array.isArray(roleValue) ? roleValue : [roleValue];
  return roles.filter((r): r is UserRole =>
    r === 'Admin' || r === 'Company' || r === 'Supplier',
  );
}

export function parseAuthUser(token: string, rolesFromApi?: string[]): AuthUser {
  const payload = decodeJwt(token);
  const email = (payload[EMAIL_CLAIM] ?? payload.email ?? '') as string;
  const id = (payload[ID_CLAIM] ?? payload.sub ?? '') as string;
  const supplierCode = (payload.SupplierCode ?? null) as string | null;
  const apiRoles = (rolesFromApi ?? []).filter(
    (r): r is UserRole => r === 'Admin' || r === 'Company' || r === 'Supplier',
  );
  const roles = apiRoles.length > 0 ? apiRoles : extractRoles(payload);

  return { id, email, roles, supplierCode };
}

export function hasRole(userRoles: UserRole[], allowed: UserRole[]): boolean {
  return userRoles.some((role) => allowed.includes(role));
}

export function isCompanyOrAdmin(roles: UserRole[]): boolean {
  return roles.includes('Admin') || roles.includes('Company');
}
