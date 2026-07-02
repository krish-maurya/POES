import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, ClipboardList, Trash2, X, ChevronDown, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/require-auth";
import { PageBody, PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ApiError,
  createPurchaseOrder,
  getItems,
  getPurchaseOrders,
  getSuppliers,
} from "@/lib/api";
import type { Item, POLine, PurchaseOrder as PO, Supplier } from "@/lib/api";
import { money, date } from "@/lib/format";

export const Route = createFileRoute("/purchase-orders")({
  head: () => ({ meta: [{ title: "Purchase Orders · POES" }] }),
  component: () => (
    <RequireAuth roles={["Company"]}>
      <PurchaseOrdersPage />
    </RequireAuth>
  ),
});

function PurchaseOrdersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: getPurchaseOrders,
    retry: (n, e) => !(e instanceof ApiError) && n < 2,
  });

  const rows = (data ?? []).filter((p) => {
    if (!q) return true;
    const t = q.toLowerCase();
    return [p.poNumber, p.number, p.supplierCode, p.supplierName, p.status]
      .some((v) => String(v ?? "").toLowerCase().includes(t));
  });

  const toggle = (k: string) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });
  };

  return (
    <>
      <PageHeader
        title="Purchase orders"
        description="Create and track orders across your suppliers."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New purchase order
          </Button>
        }
      />
      <PageBody>
        <Card className="p-0">
          <div className="flex items-center gap-3 border-b border-border/60 p-4">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search PO#, supplier, status…" className="pl-9" />
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {isLoading ? "Loading…" : `${rows.length} of ${data?.length ?? 0}`}
            </div>
          </div>

          {isError ? (
            <div className="p-6"><ErrorState
              title="Couldn't load purchase orders"
              description={error instanceof Error ? error.message : undefined}
              action={<Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>}
            /></div>
          ) : isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6"><EmptyState icon={ClipboardList}
              title={q ? "No matches" : "No purchase orders"}
              description={q ? "Try a different search." : "Create a PO to send to a supplier."}
              action={!q ? (
                <Button size="sm" onClick={() => setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New purchase order
                </Button>
              ) : undefined} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>PO #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order date</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p, i) => {
                  const key = String(p.id ?? p.poNumber ?? i);
                  const isOpen = expanded.has(key);
                  const lines = p.lines ?? p.items ?? [];
                  return (
                    <>
                      <TableRow key={key} className="cursor-pointer" onClick={() => toggle(key)}>
                        <TableCell>
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </TableCell>
                        <TableCell className="font-medium">
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                            {p.poNumber ?? p.number ?? p.id}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{p.supplierName ?? p.supplierCode ?? "—"}</div>
                          {p.supplierName && p.supplierCode ? (
                            <div className="text-[11px] text-muted-foreground">{p.supplierCode}</div>
                          ) : null}
                        </TableCell>
                        <TableCell><StatusBadge value={p.status} /></TableCell>
                        <TableCell className="text-muted-foreground">{date(p.orderDate)}</TableCell>
                        <TableCell className="text-muted-foreground">{date(p.expectedDate)}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{money(p.totalAmount)}</TableCell>
                      </TableRow>
                      {isOpen ? (
                        <TableRow key={key + "-details"} className="bg-muted/30 hover:bg-muted/30">
                          <TableCell />
                          <TableCell colSpan={6} className="py-3">
                            {lines.length === 0 ? (
                              <div className="text-xs text-muted-foreground">No line items.</div>
                            ) : (
                              <div className="overflow-hidden rounded-md border border-border/60 bg-background">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Item</TableHead>
                                      <TableHead className="text-right">Qty</TableHead>
                                      <TableHead className="text-right">Received</TableHead>
                                      <TableHead className="text-right">Unit price</TableHead>
                                      <TableHead className="text-right">Line total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {lines.map((l, li) => (
                                      <TableRow key={String(l.id ?? li)}>
                                        <TableCell>
                                          <div className="font-medium">{l.itemSku ?? l.sku ?? "—"}</div>
                                          <div className="text-[11px] text-muted-foreground">{l.description ?? ""}</div>
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">{l.quantity ?? 0}</TableCell>
                                        <TableCell className="text-right tabular-nums text-muted-foreground">
                                          {l.quantityReceived ?? 0}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">{money(l.unitPrice)}</TableCell>
                                        <TableCell className="text-right tabular-nums">
                                          {money((Number(l.quantity)||0) * (Number(l.unitPrice)||0))}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </PageBody>

      <NewPODialog open={open} onOpenChange={setOpen}
        onCreated={() => qc.invalidateQueries({ queryKey: ["purchase-orders"] })} />
    </>
  );
}

function NewPODialog({
  open, onOpenChange, onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
}) {
  const [supplierCode, setSupplierCode] = useState<string>("");
  const [expectedDate, setExpectedDate] = useState<string>("");
  const [lines, setLines] = useState<POLine[]>([
    { itemSku: "", quantity: 1, unitPrice: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  const suppliersQ = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
    enabled: open,
  });
  const itemsQ = useQuery({
    queryKey: ["items"],
    queryFn: getItems,
    enabled: open,
  });

  const total = lines.reduce(
    (s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0,
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierCode) { toast.error("Select a supplier"); return; }
    const valid = lines.filter((l) => l.itemSku && Number(l.quantity) > 0);
    if (valid.length === 0) { toast.error("Add at least one line item"); return; }
    setSaving(true);
    try {
      await createPurchaseOrder({
        supplierCode,
        lines: valid.map((l) => ({
          itemSku: l.itemSku,
          quantity: Number(l.quantity),
        })),
      });
      toast.success("Purchase order created");
      onCreated();
      onOpenChange(false);
      setSupplierCode(""); setExpectedDate("");
      setLines([{ itemSku: "", quantity: 1, unitPrice: 0 }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally { setSaving(false); }
  };

  const updateLine = (i: number, patch: Partial<POLine>) => {
    setLines((ls) => ls.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  };
  const removeLine = (i: number) => setLines((ls) => ls.filter((_, idx) => idx !== i));
  const addLine = () => setLines((ls) => [...ls, { itemSku: "", quantity: 1, unitPrice: 0 }]);

  const onPickItem = (i: number, sku: string) => {
    const item = itemsQ.data?.find((it) => it.sku === sku);
    updateLine(i, { itemSku: sku, unitPrice: item?.unitPrice ?? 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New purchase order</DialogTitle>
          <DialogDescription>Select a supplier and add line items.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Supplier *</Label>
              <Select value={supplierCode} onValueChange={setSupplierCode}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {(suppliersQ.data ?? []).map((s) => (
                    <SelectItem key={String(s.id ?? s.code)} value={String(s.code ?? s.id)}>
                      {s.name} {s.code ? `· ${s.code}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ed">Expected date</Label>
              <Input id="ed" type="date" value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Line items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add line
              </Button>
            </div>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-[1fr_90px_110px_28px] items-end gap-2 rounded-lg border border-border/60 bg-muted/20 p-2">
                  <div>
                    <Select value={l.itemSku ?? ""} onValueChange={(v) => onPickItem(i, v)}>
                      <SelectTrigger><SelectValue placeholder="Choose item" /></SelectTrigger>
                      <SelectContent>
                        {(itemsQ.data ?? []).map((it) => (
                          <SelectItem key={String(it.id ?? it.sku)} value={String(it.sku)}>
                            {it.sku} — {it.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input type="number" min="1" placeholder="Qty"
                    value={String(l.quantity ?? "")}
                    onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })} />
                  <Input type="number" step="0.01" min="0" placeholder="Unit price"
                    value={String(l.unitPrice ?? "")}
                    onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) })} />
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"
                    onClick={() => removeLine(i)} disabled={lines.length === 1}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-end gap-4 border-t border-border/60 pt-3">
              <div className="text-xs text-muted-foreground">Estimated total</div>
              <div className="text-lg font-semibold tabular-nums">{money(total)}</div>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create PO"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
