import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { PageBody, PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, Mail, Shield, Fingerprint, Copy, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { initialsOf } from "@/lib/format";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · POES" }] }),
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
});

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copy = async (v: string) => {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <>
      <PageHeader title="Profile" description="Your account and identity." />
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary text-primary-foreground text-base font-semibold">
                    {initialsOf(user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-lg">{user?.email}</CardTitle>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full">{user?.role}</Badge>
                    {user?.supplierCode ? (
                      <Badge variant="outline" className="rounded-full font-mono text-[11px]">
                        {user.supplierCode}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Row icon={Mail} label="Email" value={user?.email ?? "—"} />
              <Row icon={Shield} label="Role" value={user?.role ?? "—"} />
              {user?.supplierCode ? (
                <Row icon={Fingerprint} label="Supplier code" value={user.supplierCode}
                  action={
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => copy(user.supplierCode!)}>
                      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  } />
              ) : null}
              {user?.sub ? <Row icon={Fingerprint} label="User ID" value={user.sub} /> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Signing out will clear your access token from this device.
              </p>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => { logout(); navigate({ to: "/login" }); }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

function Row({
  icon: Icon, label, value, action,
}: { icon: typeof Mail; label: string; value: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-background text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-sm">{value}</div>
      </div>
      {action}
    </div>
  );
}
