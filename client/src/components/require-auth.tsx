import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth, type Role } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export function RequireAuth({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Role[];
}) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      navigate({
        to: "/login",
        search: { redirect: pathname } as never,
        replace: true,
      });
    } else if (roles && !user.roles.some((role) => roles.includes(role))) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [user, ready, roles, navigate, pathname]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (roles && !user.roles.some((role) => roles.includes(role))) return null;

  return <AppShell>{children}</AppShell>;
}
