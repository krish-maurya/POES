import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdDelete } from 'react-icons/md';
import { purchaseOrderService } from '@/services/purchaseOrderService';
import { supplierService } from '@/services/supplierService';
import { itemService } from '@/services/itemService';
import { useAuth } from '@/hooks/useAuth';
import { useTableData } from '@/hooks/useTableData';
import { PageHeader } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Loader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ORDER_STATUS_LABELS } from '@/constants';
import { formatCurrency, formatDate, formatNumber } from '@/utils/format';
import { OrderStatus, type POHeaderCreateDto, type POLineCreateDto, type POLineReadDto } from '@/types';

export default function PurchaseOrdersPage() {
  const queryClient = useQueryClient();
  const { user, isCompanyOrAdmin } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [lineOpen, setLineOpen] = useState(false);
  const [deleteLine, setDeleteLine] = useState<POLineReadDto | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['purchaseorders'],
    queryFn: purchaseOrderService.getAll,
  });

  const filteredOrders =
    user?.roles.includes('Supplier') && user.supplierCode
      ? orders?.filter((o) => o.supplierCode === user.supplierCode)
      : orders;

  const { data: selectedHeader } = useQuery({
    queryKey: ['purchaseorder', selectedOrder],
    queryFn: () => purchaseOrderService.getByOrderNo(selectedOrder!),
    enabled: !!selectedOrder,
  });

  const { data: orderTotal } = useQuery({
    queryKey: ['purchaseorder-total', selectedOrder],
    queryFn: () => purchaseOrderService.getTotal(selectedOrder!),
    enabled: !!selectedOrder,
  });

  const { data: lines = [] } = useQuery({
    queryKey: ['po-lines', selectedOrder],
    queryFn: () => [] as POLineReadDto[],
    enabled: !!selectedOrder,
    initialData: [],
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierService.getAll,
    enabled: isCompanyOrAdmin(),
  });

  const { data: items } = useQuery({
    queryKey: ['items'],
    queryFn: itemService.getAll,
  });

  const table = useTableData(filteredOrders, ['orderNumber', 'supplierCode'], 'orderDate');

  const createForm = useForm<POHeaderCreateDto>();
  const lineForm = useForm<POLineCreateDto>({ defaultValues: { orderedQuantity: 1 } });

  const createMutation = useMutation({
    mutationFn: purchaseOrderService.create,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['purchaseorders'] });
      toast.success('Purchase order created');
      setCreateOpen(false);
      setSelectedOrder(created.orderNumber);
    },
  });

  const addLineMutation = useMutation({
    mutationFn: ({ orderNo, dto }: { orderNo: string; dto: POLineCreateDto }) =>
      purchaseOrderService.addLine(orderNo, dto),
    onSuccess: (line, { orderNo }) => {
      queryClient.setQueryData<POLineReadDto[]>(['po-lines', orderNo], (old = []) => {
        const exists = old.find((l) => l.position === line.position);
        return exists ? old.map((l) => (l.position === line.position ? line : l)) : [...old, line];
      });
      queryClient.invalidateQueries({ queryKey: ['purchaseorder-total', orderNo] });
      toast.success('Line added');
      setLineOpen(false);
      lineForm.reset({ orderedQuantity: 1 });
    },
  });

  const deleteLineMutation = useMutation({
    mutationFn: ({ orderNo, position }: { orderNo: string; position: number }) =>
      purchaseOrderService.deleteLine(orderNo, position),
    onSuccess: (_, { orderNo, position }) => {
      queryClient.setQueryData<POLineReadDto[]>(['po-lines', orderNo], (old = []) =>
        old.filter((l) => l.position !== position),
      );
      queryClient.invalidateQueries({ queryKey: ['purchaseorder-total', orderNo] });
      toast.success('Line deleted');
      setDeleteLine(null);
    },
  });

  const supplierItems =
    items?.filter((i) => i.supplierCode === selectedHeader?.supplierCode) ?? [];

  const statusVariant = (status: OrderStatus) => {
    if (status === OrderStatus.Delivered) return 'success' as const;
    if (status === OrderStatus.OrderDelivery) return 'warning' as const;
    return 'info' as const;
  };

  return (
    <div>
      <PageHeader
        title="Global Orders & Logistics"
        subtitle="Manage purchase orders and line items"
        actions={
          isCompanyOrAdmin() && (
            <Button onClick={() => setCreateOpen(true)}>
              <MdAdd className="h-4 w-4" /> New Order
            </Button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <SearchBar
            value={table.search}
            onChange={(v) => {
              table.setSearch(v);
              table.setPage(1);
            }}
            placeholder="Search orders..."
            className="mb-4"
          />
          {isLoading ? (
            <Loader />
          ) : !filteredOrders?.length ? (
            <EmptyState title="No purchase orders" />
          ) : (
            <div className="max-h-[600px] space-y-2 overflow-y-auto">
              {table.paged.map((order) => (
                <button
                  key={order.orderNumber}
                  onClick={() => setSelectedOrder(order.orderNumber)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedOrder === order.orderNumber
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{order.orderNumber}</span>
                    <Badge variant={statusVariant(order.orderStatus)}>
                      {ORDER_STATUS_LABELS[order.orderStatus]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">{order.supplierCode}</p>
                  <p className="text-xs text-muted">{formatDate(order.orderDate)}</p>
                </button>
              ))}
            </div>
          )}
        </Card>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {selectedOrder && selectedHeader ? (
              <motion.div
                key={selectedOrder}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card>
                  <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedHeader.orderNumber}</h2>
                      <p className="text-sm text-muted">Supplier: {selectedHeader.supplierCode}</p>
                      <p className="text-sm text-muted">Date: {formatDate(selectedHeader.orderDate)}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={statusVariant(selectedHeader.orderStatus)}>
                        {ORDER_STATUS_LABELS[selectedHeader.orderStatus]}
                      </Badge>
                      {orderTotal !== undefined && (
                        <p className="mt-2 text-lg font-bold text-white">
                          {formatCurrency(orderTotal)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Order Lines</h3>
                    {isCompanyOrAdmin() &&
                      selectedHeader.orderStatus !== OrderStatus.Delivered && (
                        <Button size="sm" onClick={() => setLineOpen(true)}>
                          <MdAdd className="h-4 w-4" /> Add Line
                        </Button>
                      )}
                  </div>

                  {lines.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted">
                      No lines in this session. Add a line to get started.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {lines.map((line) => (
                        <div
                          key={line.position}
                          className="flex items-center justify-between rounded-xl border border-border p-3"
                        >
                          <div>
                            <p className="font-medium text-white">{line.itemCode}</p>
                            <p className="text-xs text-muted">
                              Pos {line.position} · Qty {formatNumber(line.orderedQuantity)} ·{' '}
                              {formatCurrency(line.price)}
                            </p>
                          </div>
                          {isCompanyOrAdmin() &&
                            selectedHeader.orderStatus !== OrderStatus.Delivered && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteLine(line)}
                              >
                                <MdDelete className="h-4 w-4 text-danger" />
                              </Button>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            ) : (
              <Card>
                <EmptyState
                  title="Select an order"
                  description="Choose a purchase order from the list to view details."
                />
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Purchase Order">
        <form
          onSubmit={createForm.handleSubmit((d) => createMutation.mutate(d))}
          className="space-y-4"
        >
          <Select
            label="Supplier"
            options={[
              { value: '', label: 'Select supplier...' },
              ...(suppliers?.map((s) => ({
                value: s.supplierCode,
                label: `${s.supplierCode} — ${s.description}`,
              })) ?? []),
            ]}
            error={createForm.formState.errors.supplierCode?.message}
            {...createForm.register('supplierCode', { required: 'Required' })}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={lineOpen} onClose={() => setLineOpen(false)} title="Add Order Line">
        <form
          onSubmit={lineForm.handleSubmit((d) =>
            selectedOrder && addLineMutation.mutate({ orderNo: selectedOrder, dto: d }),
          )}
          className="space-y-4"
        >
          <Select
            label="Item"
            options={[
              { value: '', label: 'Select item...' },
              ...supplierItems.map((i) => ({
                value: i.itemCode,
                label: `${i.itemCode} — ${i.description}`,
              })),
            ]}
            error={lineForm.formState.errors.itemCode?.message}
            {...lineForm.register('itemCode', { required: 'Required' })}
          />
          <Input
            label="Ordered Quantity"
            type="number"
            step="0.01"
            error={lineForm.formState.errors.orderedQuantity?.message}
            {...lineForm.register('orderedQuantity', {
              valueAsNumber: true,
              required: 'Required',
              min: 0.01,
            })}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setLineOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={addLineMutation.isPending}>
              Add Line
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteLine}
        onClose={() => setDeleteLine(null)}
        onConfirm={() =>
          deleteLine &&
          selectedOrder &&
          deleteLineMutation.mutate({
            orderNo: selectedOrder,
            position: deleteLine.position,
          })
        }
        title="Delete Line"
        message={`Delete line ${deleteLine?.position}?`}
        loading={deleteLineMutation.isPending}
      />
    </div>
  );
}
