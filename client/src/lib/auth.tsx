import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, getToken, setToken } from "./api";

export type Role = "Company" | "Supplier";

export interface AuthUser {
  email: string;
  role: Role;
  roles: Role[];
  supplierCode?: string | null;
  sub?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (dto: RegisterInput) => Promise<void>;
  logout: () => void;
}

export interface RegisterInput {
  email: string;
  password: string;
  role: Role;
  supplierCode?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeRole(value: unknown): Role | null {
  if (typeof value !== "string") return null;
  const role = value.trim().toLowerCase();
  if (role === "supplier") return "Supplier";
  if (role === "company") return "Company";
  return null;
}

function normalizeRoles(value: unknown): Role[] {
  const values = Array.isArray(value) ? value : [value];
  return values
    .map(normalizeRole)
    .filter((role): role is Role => role !== null);
}

function b64UrlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  if (typeof atob === "function") return atob(b64);
  return "";
}

export function decodeJwt(token: string): AuthUser | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = b64UrlDecode(payload);
    const claims = JSON.parse(json) as Record<string, unknown>;
    const email =
      (claims.email as string) ??
      (claims[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ] as string) ??
      (claims.sub as string) ??
      "";
    const roleClaim =
      claims.role ??
      claims[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];
    const roles = normalizeRoles(roleClaim);
    const role = roles[0] ?? "Company";
    const supplierCode =
      (claims.supplierCode as string | undefined) ??
      (claims.SupplierCode as string | undefined) ??
      null;
    return {
      email,
      role,
      roles: roles.length ? roles : [role],
      supplierCode,
      sub: claims.sub as string | undefined,
    };
  } catch {
    return null;
  }
}

interface LoginResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  role?: Role;
  roles?: Role[];
  email?: string;
  supplierCode?: string;
  SupplierCode?: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<AuthUser | null>(() => {
    const t = getToken();
    return t ? decodeJwt(t) : null;
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      token,
      ready,
      async login(email, password) {
        const res = await api<LoginResponse>("/api/auth/login", {
          method: "POST",
          auth: false,
          body: { email, password },
        });
        const tok = res.token ?? res.accessToken ?? res.jwt ?? "";
        if (!tok)
          throw new Error("Sign in succeeded but no token was returned.");
        setToken(tok);
        setTokenState(tok);
        const decoded = decodeJwt(tok) ?? {
          email: res.email ?? email,
          role: normalizeRole(res.role) ?? normalizeRoles(res.roles)[0] ?? "Company",
          roles: normalizeRoles(res.roles ?? res.role),
          supplierCode: res.supplierCode ?? res.SupplierCode ?? null,
        };
        const roles = decoded.roles.length ? decoded.roles : [decoded.role];
        const user = { ...decoded, roles };
        setUser(user);
        return user;
      },
      async register(dto) {
        await api("/api/auth/register", {
          method: "POST",
          auth: false,
          body: dto,
        });
      },
      logout() {
        setToken(null);
        setTokenState(null);
        setUser(null);
      },
    }),
    [user, token, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
