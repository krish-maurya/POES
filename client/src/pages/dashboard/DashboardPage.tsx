import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdBusiness,
  MdInventory2,
  MdShoppingCart,
  MdLocalShipping,
  MdAdd,
} from 'react-icons/md';
import { itemService } from '@/services/itemService';
import { supplierService } from '@/services/supplierService';
import { purchaseOrderService } from '@/services/purchaseOrderService';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/layout/Breadcrumb';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loader, TableSkeleton } from '@/components/ui/Loader';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { ORDER_STATUS_LABELS } from '@/constants';
import { formatDate } from '@/utils/format';
import type { POHeaderReadDto } from '@/types';

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  delay,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted">{title}</p>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
            {trend && <p className="mt-1 text-xs text-success">{trend}</p>}
          </div>
          <div className="rounded-xl bg-primary/20 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, isCompanyOrAdmin } = useAuth();

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['items'],
    queryFn: itemService.getAll,
  });

  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierService.getAll,
    enabled: isCompanyOrAdmin(),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['purchaseorders'],
    queryFn: purchaseOrderService.getAll,
  });

  const filteredOrders =
    user?.roles.includes('Supplier') && user.supplierCode
      ? orders?.filter((o) => o.supplierCode === user.supplierCode)
      : orders;

  const filteredItems =
    user?.roles.includes('Supplier') && user.supplierCode
      ? items?.filter((i) => i.supplierCode === user.supplierCode)
      : items;

  const recentOrders = filteredOrders?.slice(0, 5) ?? [];
  const loading = itemsLoading || ordersLoading || (isCompanyOrAdmin() && suppliersLoading);

  const statusVariant = (status: number) => {
    if (status === 3) return 'success' as const;
    if (status === 2) return 'warning' as const;
    return 'info' as const;
  };

  return (
    <div>
      <PageHeader
        title="Command Center"
        subtitle="Overview of your purchase order operations"
      />

      {loading ? (
        <TableSkeleton rows={3} cols={4} />
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isCompanyOrAdmin() && (
              <MetricCard
                title="Total Suppliers"
                value={suppliers?.length ?? 0}
                icon={MdBusiness}
                delay={0}
              />
            )}
            <MetricCard
              title="Total SKUs"
              value={filteredItems?.length ?? 0}
              icon={MdInventory2}
              delay={0.05}
            />
            <MetricCard
              title="Purchase Orders"
              value={filteredOrders?.length ?? 0}
              icon={MdShoppingCart}
              delay={0.1}
            />
            <MetricCard
              title="Active Deliveries"
              value={
                filteredOrders?.filter((o) => o.orderStatus === 2).length ?? 0
              }
              icon={MdLocalShipping}
              delay={0.15}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Purchase Orders</CardTitle>
                <Link to="/purchase-orders">
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </Link>
              </CardHeader>
              {ordersLoading ? (
                <Loader />
              ) : recentOrders.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">No purchase orders yet</p>
              ) : (
                <Table<POHeaderReadDto>
                  columns={[
                    { key: 'orderNumber', header: 'Order #', sortable: true },
                    { key: 'supplierCode', header: 'Supplier', sortable: true },
                    {
                      key: 'orderDate',
                      header: 'Date',
                      render: (r) => formatDate(r.orderDate),
                    },
                    {
                      key: 'orderStatus',
                      header: 'Status',
                      render: (r) => (
                        <Badge variant={statusVariant(r.orderStatus)}>
                          {ORDER_STATUS_LABELS[r.orderStatus]}
                        </Badge>
                      ),
                    },
                  ]}
                  data={recentOrders}
                  keyExtractor={(r) => r.orderNumber}
                />
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {isCompanyOrAdmin() && (
                  <>
                    <Link to="/suppliers">
                      <Button variant="secondary" className="w-full justify-start">
                        <MdAdd className="h-4 w-4" /> New Supplier
                      </Button>
                    </Link>
                    <Link to="/purchase-orders">
                      <Button variant="secondary" className="w-full justify-start">
                        <MdAdd className="h-4 w-4" /> New Purchase Order
                      </Button>
                    </Link>
                  </>
                )}
                <Link to="/items">
                  <Button variant="secondary" className="w-full justify-start">
                    <MdInventory2 className="h-4 w-4" /> Manage Items
                  </Button>
                </Link>
                <Link to="/arrivals">
                  <Button variant="secondary" className="w-full justify-start">
                    <MdLocalShipping className="h-4 w-4" /> Track Arrivals
                  </Button>
                </Link>
              </div>

              <div className="mt-6 rounded-xl bg-surface-hover p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Activity Chart
                </p>
                <div className="mt-4 flex h-24 items-end justify-between gap-1">
                  {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-primary/40 transition-all hover:bg-primary/60"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">Weekly order volume (placeholder)</p>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
