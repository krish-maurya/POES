import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Truck,
  ClipboardList,
  Boxes,
  PackageCheck,
  ArrowUpRight,
  Package,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { PageBody, PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ApiError,
  getArrivals,
  getInventory,
  getItems,
  getPurchaseOrders,
  getSuppliers,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard · POES" }],
  }),
  component: () => (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
});

interface Counts {
  suppliers?: number;
  orders?: number;
  inventory?: number;
  arrivals?: number;
}

function useDashboardData() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["dashboard", user?.role],
    queryFn: async (): Promise<Counts> => {
      const endpoints =
        user?.role === "Supplier"
          ? [
              getItems().catch(() => []),
              getPurchaseOrders().catch(() => []),
            ]
          : [
              getSuppliers().catch(() => []),
              getPurchaseOrders().catch(() => []),
              getInventory().catch(() => []),
              getArrivals().catch(() => []),
            ];
      const results = await Promise.all(endpoints);
      if (user?.role === "Supplier") {
        return {
          inventory: safeLen(results[0]),
          orders: safeLen(results[1]),
        };
      }
      return {
        suppliers: safeLen(results[0]),
        orders: safeLen(results[1]),
        inventory: safeLen(results[2]),
        arrivals: safeLen(results[3]),
      };
    },
    retry: (count, err) => !(err instanceof ApiError) && count < 2,
    staleTime: 30_000,
  });
}

function safeLen(x: unknown) {
  return Array.isArray(x) ? x.length : 0;
}

function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useDashboardData();
  const isSupplier = user?.role === "Supplier";
  const greeting = getGreeting();

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user?.email?.split("@")[0] ?? "there"}`}
        description={
          isSupplier
            ? "Manage your catalog and stay on top of assigned purchase orders."
            : "Track suppliers, orders, arrivals, and stock at a glance."
        }
        actions={
          isSupplier ? (
            <Button asChild>
              <Link to="/items">
                <Package className="mr-2 h-4 w-4" /> New item
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/purchase-orders">
                <ClipboardList className="mr-2 h-4 w-4" /> New purchase order
              </Link>
            </Button>
          )
        }
      />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isSupplier ? (
            <>
              <StatCard
                title="My items"
                value={data?.inventory}
                loading={isLoading}
                icon={Package}
                to="/items"
                hint="Catalog you manage"
              />
              <StatCard
                title="Assigned orders"
                value={data?.orders}
                loading={isLoading}
                icon={ShoppingCart}
                to="/orders"
                hint="Purchase orders from companies"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Suppliers"
                value={data?.suppliers}
                loading={isLoading}
                icon={Truck}
                to="/suppliers"
                hint="Registered vendors"
              />
              <StatCard
                title="Purchase orders"
                value={data?.orders}
                loading={isLoading}
                icon={ClipboardList}
                to="/purchase-orders"
                hint="All orders on record"
              />
              <StatCard
                title="Arrivals"
                value={data?.arrivals}
                loading={isLoading}
                icon={PackageCheck}
                to="/arrivals"
                hint="Deliveries recorded"
              />
              <StatCard
                title="Inventory lines"
                value={data?.inventory}
                loading={isLoading}
                icon={Boxes}
                to="/inventory"
                hint="Stocked items"
              />
            </>
          )}
        </div>

        {isError ? (
          <Card className="mt-6 border-warning/40 bg-warning/5">
            <CardContent className="flex items-start gap-3 py-4">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-warning/15 text-warning">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <div className="font-medium">
                  Backend not reachable yet
                </div>
                <div className="mt-0.5 text-muted-foreground">
                  Set <code className="rounded bg-muted px-1 py-0.5 text-[11px]">VITE_API_BASE_URL</code>{" "}
                  to your API's HTTPS URL (e.g. an ngrok tunnel) in a{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-[11px]">.env</code>{" "}
                  file and restart the dev server.
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Recent activity</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Latest events across your workspace
                </p>
              </div>
              <Badge variant="secondary" className="rounded-full font-normal">
                Live
              </Badge>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={ClipboardList}
                title="No activity yet"
                description={
                  isSupplier
                    ? "When companies place orders for your items, you'll see them here."
                    : "Create your first supplier or purchase order to get started."
                }
                cta={
                  isSupplier ? (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/items">Add an item</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/suppliers">Add a supplier</Link>
                    </Button>
                  )
                }
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick actions</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Common tasks for your role
              </p>
            </CardHeader>
            <CardContent className="grid gap-2">
              {isSupplier ? (
                <>
                  <QuickAction to="/items" icon={Package} label="Manage items" />
                  <QuickAction to="/orders" icon={ShoppingCart} label="View orders" />
                  <QuickAction to="/profile" icon={Truck} label="Update profile" />
                </>
              ) : (
                <>
                  <QuickAction to="/suppliers" icon={Truck} label="Add supplier" />
                  <QuickAction to="/purchase-orders" icon={ClipboardList} label="New purchase order" />
                  <QuickAction to="/arrivals" icon={PackageCheck} label="Record arrival" />
                  <QuickAction to="/inventory" icon={Boxes} label="Check inventory" />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

function StatCard({
  title,
  value,
  hint,
  loading,
  icon: Icon,
  to,
}: {
  title: string;
  value: number | undefined;
  hint: string;
  loading: boolean;
  icon: typeof Truck;
  to: string;
}) {
  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary-soft-foreground">
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <Link
            to={to}
            className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            aria-label={`Open ${title}`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-3xl font-semibold tracking-tight tabular-nums">
              {value ?? 0}
            </div>
          )}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof Truck;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm transition-colors hover:border-border hover:bg-accent"
    >
      <div className="grid h-8 w-8 place-items-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary-soft group-hover:text-primary-soft-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 font-medium">{label}</span>
      <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60" />
    </Link>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
}: {
  icon: typeof Truck;
  title: string;
  description: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-1 max-w-xs text-xs text-muted-foreground">
          {description}
        </div>
      </div>
      {cta}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
