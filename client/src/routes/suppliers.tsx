import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Truck, Pencil, Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { PageBody, PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ApiError,
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from "@/lib/api";
import type { Supplier } from "@/lib/api";

export const Route = createFileRoute("/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers · POES" }] }),
  component: () => (
    <RequireAuth roles={["Company"]}>
      <SuppliersPage />
    </RequireAuth>
  ),
});

function SuppliersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [confirmDel, setConfirmDel] = useState<Supplier | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
    retry: (n, e) => !(e instanceof ApiError) && n < 2,
  });

  const del = useMutation({
    mutationFn: (s: Supplier) => deleteSupplier(s.code),
    onSuccess: () => {
      toast.success("Supplier removed");
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setConfirmDel(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const rows = (data ?? []).filter((s) => {
    if (!q) return true;
    const t = q.toLowerCase();
    return [s.code, s.name, s.contactEmail, s.email, s.phone]
      .some((v) => String(v ?? "").toLowerCase().includes(t));
  });

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* ignore */ }
  };

  return (
    <>
      <PageHeader
        title="Suppliers"
        description="Register suppliers and share their access codes."
        actions={
          <Button onClick={() => { setEditing(null); setOpenForm(true); }}>
            <Plus className="mr-2 h-4 w-4" /> New supplier
          </Button>
        }
      />
      <PageBody>
        <Card className="p-0">
          <div className="flex items-center gap-3 border-b border-border/60 p-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search suppliers…"
                className="pl-9"
              />
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {isLoading ? "Loading…" : `${rows.length} of ${data?.length ?? 0}`}
            </div>
          </div>

          {isError ? (
            <div className="p-6">
              <ErrorState
                title="Couldn't load suppliers"
                description={error instanceof Error ? error.message : undefined}
                action={<Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>}
              />
            </div>
          ) : isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Truck}
                title={q ? "No matches" : "No suppliers yet"}
                description={q ? "Try a different search." : "Add your first supplier to get started."}
                action={!q ? (
                  <Button size="sm" onClick={() => { setEditing(null); setOpenForm(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> New supplier
                  </Button>
                ) : undefined}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s, i) => (
                  <TableRow key={String(s.id ?? s.code ?? i)}>
                    <TableCell>
                      <button
                        onClick={() => s.code && copyCode(String(s.code))}
                        className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 font-mono text-xs hover:bg-accent"
                        title="Copy code"
                      >
                        {s.code ?? "—"}
                        {copied === s.code ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">{s.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.contactEmail ?? s.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.phone ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => { setEditing(s); setOpenForm(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                          onClick={() => setConfirmDel(s)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </PageBody>

      <SupplierFormDialog
        open={openForm}
        onOpenChange={setOpenForm}
        editing={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ["suppliers"] })}
      />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete <span className="font-medium">{confirmDel?.name ?? confirmDel?.code}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDel && del.mutate(confirmDel)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SupplierFormDialog({
  open, onOpenChange, editing, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Supplier | null;
  onSaved: () => void;
}) {
  const isEdit = !!editing;
  const [form, setForm] = useState<Partial<Supplier> & { _synced?: unknown }>({});
  const [saving, setSaving] = useState(false);

  // reset form when opening
  useState(() => {}); // noop
  if (open && !saving && form._synced !== (editing?.id ?? "new")) {
    setForm({
      code: editing?.code ?? "",
      name: editing?.name ?? "",
      contactEmail: editing?.contactEmail ?? editing?.email ?? "",
      phone: editing?.phone ?? "",
      address: editing?.address ?? "",
      _synced: editing?.id ?? "new",
    });
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const body = {
        code: form.code || undefined,
        name: form.name,
        contactEmail: form.contactEmail || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
      };
      if (isEdit) {
        await updateSupplier(editing?.code ?? "", body);
        toast.success("Supplier updated");
      } else {
        await createSupplier(body);
        toast.success("Supplier created");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit supplier" : "New supplier"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update supplier information." : "Add a new supplier to your vendor list."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={form.code ?? ""} disabled={isEdit}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="Auto if blank" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name ?? ""} required
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Contact email</Label>
              <Input id="email" type="email" value={form.contactEmail ?? ""}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone ?? ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" rows={2} value={form.address ?? ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
