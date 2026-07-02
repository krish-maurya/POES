import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingCart, ChevronDown, ChevronRight } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { PageBody, PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ApiError, getPurchaseOrders } from "@/lib/api";
import type { POLine as Line, PurchaseOrder as Order } from "@/lib/api";
import { money, date } from "@/lib/format";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Orders · POES" }] }),
  component: () => (
    <RequireAuth roles={["Supplier"]}>
      <OrdersPage />
    </RequireAuth>
  ),
});

function OrdersPage() {
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: getPurchaseOrders,
    retry: (n, e) => !(e instanceof ApiError) && n < 2,
  });

  const rows = (data ?? []).filter((p) => {
    if (!q) return true;
    const t = q.toLowerCase();
    return [p.poNumber, p.number, p.companyName, p.status]
      .some((v) => String(v ?? "").toLowerCase().includes(t));
  });

  const toggle = (k: string) => setExpanded((prev) => {
    const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n;
  });

  return (
    <>
      <PageHeader
        title="Orders"
        description="Purchase orders assigned to you."
      />
      <PageBody>
        <Card className="p-0">
          <div className="flex items-center gap-3 border-b border-border/60 p-4">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search PO#, company…" className="pl-9" />
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {isLoading ? "Loading…" : `${rows.length} of ${data?.length ?? 0}`}
            </div>
          </div>

          {isError ? (
            <div className="p-6"><ErrorState
              title="Couldn't load orders"
              description={error instanceof Error ? error.message : undefined}
              action={<Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>}
            /></div>
          ) : isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6"><EmptyState icon={ShoppingCart}
              title={q ? "No matches" : "No orders yet"}
              description={q ? "Try a different search." : "You'll see purchase orders here once a company assigns one."} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>PO #</TableHead>
                  <TableHead>Company</TableHead>
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
                        <TableCell>{isOpen ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}</TableCell>
                        <TableCell><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{p.poNumber ?? p.number ?? p.id}</code></TableCell>
                        <TableCell className="font-medium">{p.companyName ?? "—"}</TableCell>
                        <TableCell><StatusBadge value={p.status} /></TableCell>
                        <TableCell className="text-muted-foreground">{date(p.orderDate)}</TableCell>
                        <TableCell className="text-muted-foreground">{date(p.expectedDate)}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{money(p.totalAmount)}</TableCell>
                      </TableRow>
                      {isOpen ? (
                        <TableRow key={key + "-d"} className="bg-muted/30 hover:bg-muted/30">
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
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {lines.map((l, li) => (
                                      <TableRow key={String(l.id ?? li)}>
                                        <TableCell>
                                          <div className="font-medium">{l.itemSku ?? l.sku}</div>
                                          <div className="text-[11px] text-muted-foreground">{l.description}</div>
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">{l.quantity ?? 0}</TableCell>
                                        <TableCell className="text-right tabular-nums text-muted-foreground">{l.quantityReceived ?? 0}</TableCell>
                                        <TableCell className="text-right tabular-nums">{money(l.unitPrice)}</TableCell>
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
    </>
  );
}
