import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Package, Pencil, Trash2 } from "lucide-react";
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
  createItem,
  deleteItem,
  getItems,
  updateItem,
} from "@/lib/api";
import type { Item } from "@/lib/api";
import { money } from "@/lib/format";

export const Route = createFileRoute("/items")({
  head: () => ({ meta: [{ title: "Items · POES" }] }),
  component: () => (
    <RequireAuth roles={["Supplier"]}>
      <ItemsPage />
    </RequireAuth>
  ),
});

function ItemsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [confirmDel, setConfirmDel] = useState<Item | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["items"],
    queryFn: getItems,
    retry: (n, e) => !(e instanceof ApiError) && n < 2,
  });

  const del = useMutation({
    mutationFn: (i: Item) => deleteItem(i.sku),
    onSuccess: () => {
      toast.success("Item removed");
      qc.invalidateQueries({ queryKey: ["items"] });
      setConfirmDel(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const rows = (data ?? []).filter((i) => {
    if (!q) return true;
    const t = q.toLowerCase();
    return [i.sku, i.name, i.description].some((v) =>
      String(v ?? "").toLowerCase().includes(t),
    );
  });

  return (
    <>
      <PageHeader
        title="Items"
        description="Manage the catalog of items you supply."
        actions={
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> New item
          </Button>
        }
      />
      <PageBody>
        <Card className="p-0">
          <div className="flex items-center gap-3 border-b border-border/60 p-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search items…" className="pl-9" />
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {isLoading ? "Loading…" : `${rows.length} of ${data?.length ?? 0}`}
            </div>
          </div>

          {isError ? (
            <div className="p-6">
              <ErrorState
                title="Couldn't load items"
                description={error instanceof Error ? error.message : undefined}
                action={<Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>}
              />
            </div>
          ) : isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Package}
                title={q ? "No matches" : "No items yet"}
                description={q ? "Try a different search." : "Add your first item to the catalog."}
                action={!q ? (
                  <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> New item
                  </Button>
                ) : undefined}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Unit price</TableHead>
                  <TableHead>UoM</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((i, idx) => (
                  <TableRow key={String(i.id ?? i.sku ?? idx)}>
                    <TableCell><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{i.sku ?? "—"}</code></TableCell>
                    <TableCell className="font-medium">{i.name ?? "—"}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{i.description ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{money(i.unitPrice)}</TableCell>
                    <TableCell className="text-muted-foreground">{i.unitOfMeasure ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => { setEditing(i); setOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                          onClick={() => setConfirmDel(i)}>
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

      <ItemFormDialog open={open} onOpenChange={setOpen} editing={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ["items"] })} />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete <span className="font-medium">{confirmDel?.name ?? confirmDel?.sku}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDel && del.mutate(confirmDel)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ItemFormDialog({
  open, onOpenChange, editing, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Item | null;
  onSaved: () => void;
}) {
  const isEdit = !!editing;
  const [form, setForm] = useState<Partial<Item> & { _s?: unknown }>({});
  const [saving, setSaving] = useState(false);

  if (open && form._s !== (editing?.id ?? "new")) {
    setForm({
      sku: editing?.sku ?? "",
      name: editing?.name ?? "",
      description: editing?.description ?? "",
      unitPrice: editing?.unitPrice ?? 0,
      unitOfMeasure: editing?.unitOfMeasure ?? "ea",
      _s: editing?.id ?? "new",
    });
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku?.trim() || !form.name?.trim()) {
      toast.error("SKU and name are required"); return;
    }
    setSaving(true);
    try {
      const body = {
        sku: form.sku, name: form.name,
        description: form.description || undefined,
        unitPrice: Number(form.unitPrice) || 0,
        unitOfMeasure: form.unitOfMeasure || undefined,
      };
      if (isEdit) {
        await updateItem(editing?.sku ?? "", body);
        toast.success("Item updated");
      } else {
        await createItem(body);
        toast.success("Item created");
      }
      onSaved(); onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit item" : "New item"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update item details." : "Add a new item to your catalog."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" value={form.sku ?? ""} required disabled={isEdit}
                onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name ?? ""} required
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" rows={2} value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">Unit price</Label>
              <Input id="price" type="number" step="0.01" min="0"
                value={String(form.unitPrice ?? 0)}
                onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uom">Unit of measure</Label>
              <Input id="uom" value={form.unitOfMeasure ?? ""}
                onChange={(e) => setForm({ ...form, unitOfMeasure: e.target.value })}
                placeholder="ea, kg, box…" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
