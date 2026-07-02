import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, PackageCheck, X } from "lucide-react";
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  getArrivals,
  getPurchaseOrders,
  recordArrival,
} from "@/lib/api";
import type { Arrival, PurchaseOrder as PO } from "@/lib/api";
import { dateTime } from "@/lib/format";

export const Route = createFileRoute("/arrivals")({
  head: () => ({ meta: [{ title: "Arrivals · POES" }] }),
  component: () => (
    <RequireAuth roles={["Company"]}>
      <ArrivalsPage />
    </RequireAuth>
  ),
});

function ArrivalsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["arrivals"],
    queryFn: getArrivals,
    retry: (n, e) => !(e instanceof ApiError) && n < 2,
  });

  const rows = (data ?? []).filter((a) => {
    if (!q) return true;
    const t = q.toLowerCase();
    return [a.poNumber, a.notes].some((v) => String(v ?? "").toLowerCase().includes(t));
  });

  return (
    <>
      <PageHeader
        title="Arrivals"
        description="Record deliveries — inventory updates automatically."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Record arrival
          </Button>
        }
      />
      <PageBody>
        <Card className="p-0">
          <div className="flex items-center gap-3 border-b border-border/60 p-4">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search by PO# or notes…" className="pl-9" />
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {isLoading ? "Loading…" : `${rows.length} of ${data?.length ?? 0}`}
            </div>
          </div>

          {isError ? (
            <div className="p-6"><ErrorState
              title="Couldn't load arrivals"
              description={error instanceof Error ? error.message : undefined}
              action={<Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>}
            /></div>
          ) : isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6"><EmptyState icon={PackageCheck}
              title={q ? "No matches" : "No arrivals recorded"}
              description={q ? "Try a different search." : "Record your first delivery to update inventory."}
              action={!q ? (
                <Button size="sm" onClick={() => setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Record arrival
                </Button>
              ) : undefined} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO #</TableHead>
                  <TableHead>Arrival date</TableHead>
                  <TableHead>Lines</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a, i) => (
                  <TableRow key={String(a.id ?? i)}>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{a.poNumber ?? a.poId ?? "—"}</code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{dateTime(a.arrivalDate)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(a.lines ?? []).map((l, li) => (
                          <span key={li} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                            {l.itemSku} × {l.quantityReceived}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{a.notes ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </PageBody>

      <RecordArrivalDialog open={open} onOpenChange={setOpen}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["arrivals"] });
          qc.invalidateQueries({ queryKey: ["inventory"] });
          qc.invalidateQueries({ queryKey: ["purchase-orders"] });
        }} />
    </>
  );
}

function RecordArrivalDialog({
  open, onOpenChange, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
}) {
  const [poId, setPoId] = useState<string>("");
  const [arrivalDate, setArrivalDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [received, setReceived] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const posQ = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: getPurchaseOrders,
    enabled: open,
  });

  const po = posQ.data?.find((p) => String(p.id ?? p.poNumber) === poId);
  const lines = po?.lines ?? po?.items ?? [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!po) { toast.error("Select a purchase order"); return; }
    const linesPayload = lines
      .map((l) => ({
        itemSku: l.itemSku ?? l.sku,
        position: l.position,
        quantityReceived: Number(received[String(l.id ?? l.itemSku)] ?? 0),
      }))
      .filter((l) => l.quantityReceived > 0);
    if (linesPayload.length === 0) { toast.error("Enter at least one received quantity"); return; }
    setSaving(true);
    try {
      await Promise.all(linesPayload.map((line) =>
        recordArrival({
          orderNumber: po.poNumber,
          position: line.position,
          arrivedQuantity: line.quantityReceived,
          arrivalDate,
        }),
      ));
      toast.success("Arrival recorded");
      onSaved(); onOpenChange(false);
      setPoId(""); setReceived({}); setNotes("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record");
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record arrival</DialogTitle>
          <DialogDescription>Enter received quantities for a purchase order.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Purchase order *</Label>
              <Select value={poId} onValueChange={setPoId}>
                <SelectTrigger><SelectValue placeholder="Select PO" /></SelectTrigger>
                <SelectContent>
                  {(posQ.data ?? []).map((p) => (
                    <SelectItem key={String(p.id ?? p.poNumber)} value={String(p.id ?? p.poNumber)}>
                      {p.poNumber ?? p.id} · {p.supplierName ?? p.supplierCode ?? "—"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ad">Arrival date *</Label>
              <Input id="ad" type="date" value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)} required />
            </div>
          </div>

          {po ? (
            <div className="rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Ordered</TableHead>
                    <TableHead className="text-right">Already received</TableHead>
                    <TableHead className="w-32 text-right">Receiving now</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((l, i) => {
                    const key = String(l.id ?? l.itemSku ?? i);
                    const remaining = (Number(l.quantity)||0) - (Number(l.quantityReceived)||0);
                    return (
                      <TableRow key={key}>
                        <TableCell>
                          <div className="font-medium">{l.itemSku ?? l.sku}</div>
                          <div className="text-[11px] text-muted-foreground">{l.description}</div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{l.quantity ?? 0}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {l.quantityReceived ?? 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input type="number" min="0" max={remaining} className="h-8 text-right"
                            value={String(received[key] ?? "")}
                            onChange={(e) => setReceived({ ...received, [key]: Number(e.target.value) })}
                            placeholder={String(remaining)} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center text-xs text-muted-foreground">
              Select a purchase order to see its line items.
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" disabled={saving || !po}>
              {saving ? "Saving…" : "Record arrival"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
