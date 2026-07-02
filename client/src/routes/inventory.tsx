import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Boxes, RefreshCw } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { PageBody, PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ApiError, getInventory } from "@/lib/api";
import type { InventoryRow as InvRow } from "@/lib/api";
import { num } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory · POES" }] }),
  component: () => (
    <RequireAuth roles={["Company"]}>
      <InventoryPage />
    </RequireAuth>
  ),
});

function InventoryPage() {
  const [q, setQ] = useState("");
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["inventory"],
    queryFn: getInventory,
    retry: (n, e) => !(e instanceof ApiError) && n < 2,
  });

  const rows = (data ?? []).filter((r) => {
    if (!q) return true;
    const t = q.toLowerCase();
    return [r.sku, r.itemSku, r.name, r.itemName].some((v) =>
      String(v ?? "").toLowerCase().includes(t),
    );
  });

  const totalOnHand = rows.reduce((s, r) => s + (Number(r.quantityOnHand ?? r.onHand) || 0), 0);
  const totalAvail = rows.reduce((s, r) => s + (Number(r.quantityAvailable ?? r.available) || 0), 0);

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Live stock levels across your catalog."
        actions={
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} /> Refresh
          </Button>
        }
      />
      <PageBody>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <StatTile label="Items tracked" value={rows.length} />
          <StatTile label="Total on hand" value={totalOnHand} />
          <StatTile label="Total available" value={totalAvail} />
        </div>
        <Card className="p-0">
          <div className="flex items-center gap-3 border-b border-border/60 p-4">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search items…" className="pl-9" />
            </div>
          </div>

          {isError ? (
            <div className="p-6"><ErrorState
              title="Couldn't load inventory"
              description={error instanceof Error ? error.message : undefined}
              action={<Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>}
            /></div>
          ) : isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6"><EmptyState icon={Boxes}
              title={q ? "No matches" : "No inventory yet"}
              description={q ? "Try a different search." : "Record an arrival to seed inventory."} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">On hand</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Incoming</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => {
                  const avail = Number(r.quantityAvailable ?? r.available) || 0;
                  const low = false;
                  return (
                    <TableRow key={String(r.id ?? r.sku ?? i)}>
                      <TableCell><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.sku ?? r.itemSku ?? "—"}</code></TableCell>
                      <TableCell className="font-medium">{r.name ?? r.itemName ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{num(r.quantityOnHand ?? r.onHand ?? 0)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{num(r.quantityAllocated ?? r.allocated ?? 0)}</TableCell>
                      <TableCell className={cn("text-right tabular-nums font-medium", low && "text-warning")}>
                        {num(avail)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{num(r.quantityIncoming ?? r.incoming ?? 0)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </PageBody>
    </>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{num(value)}</div>
    </Card>
  );
}
