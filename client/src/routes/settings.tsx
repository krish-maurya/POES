import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { PageBody, PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun, Save } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { API_BASE } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · POES" }] }),
  component: () => (
    <RequireAuth>
      <SettingsPage />
    </RequireAuth>
  ),
});

const PREFS_KEY = "poes.prefs";
interface Prefs {
  emailNotifications: boolean;
  desktopNotifications: boolean;
  compactTables: boolean;
}
const DEFAULT_PREFS: Prefs = {
  emailNotifications: true,
  desktopNotifications: false,
  compactTables: false,
};

function SettingsPage() {
  const { theme, set: setTheme } = useTheme();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  const save = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    toast.success("Preferences saved");
  };

  return (
    <>
      <PageHeader title="Settings" description="Customize your experience." />
      <PageBody>
        <div className="mx-auto max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="mb-3 block text-xs uppercase tracking-wider text-muted-foreground">Theme</Label>
              <div className="grid grid-cols-2 gap-2">
                <ThemeCard active={theme === "light"} onClick={() => setTheme("light")}
                  icon={Sun} label="Light" />
                <ThemeCard active={theme === "dark"} onClick={() => setTheme("dark")}
                  icon={Moon} label="Dark" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Row label="Email notifications"
                description="Receive updates about orders and arrivals."
                checked={prefs.emailNotifications}
                onChange={(v) => setPrefs({ ...prefs, emailNotifications: v })} />
              <Row label="Desktop notifications"
                description="Browser notifications while POES is open."
                checked={prefs.desktopNotifications}
                onChange={(v) => setPrefs({ ...prefs, desktopNotifications: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Display</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Row label="Compact tables"
                description="Tighter row spacing for more data on screen."
                checked={prefs.compactTables}
                onChange={(v) => setPrefs({ ...prefs, compactTables: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>API base URL</Label>
                <Input value={API_BASE} readOnly className="font-mono text-xs" />
                <p className="text-[11px] text-muted-foreground">
                  Set <code className="rounded bg-muted px-1 py-0.5">VITE_API_BASE_URL</code> in <code className="rounded bg-muted px-1 py-0.5">.env</code> and restart the dev server to change this.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={save}>
              <Save className="mr-2 h-4 w-4" /> Save preferences
            </Button>
          </div>
        </div>
      </PageBody>
    </>
  );
}

function ThemeCard({
  active, onClick, icon: Icon, label,
}: { active: boolean; onClick: () => void; icon: typeof Sun; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex flex-col items-center gap-2 rounded-lg border px-4 py-4 text-sm transition-colors " +
        (active
          ? "border-primary bg-primary-soft text-primary-soft-foreground"
          : "border-border hover:border-primary/40 hover:bg-accent")
      }
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

function Row({
  label, description, checked, onChange,
}: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
