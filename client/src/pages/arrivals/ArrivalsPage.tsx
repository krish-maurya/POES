import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axios from 'axios';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { purchaseOrderService } from '@/services/purchaseOrderService';
import { arrivalService } from '@/services/arrivalService';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Loader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatNumber, toApiDate, toInputDate } from '@/utils/format';
import type { ArrivalCreateDto, ArrivalReadDto, ArrivalUpdateDto } from '@/types';

interface ArrivalEntry extends ArrivalReadDto {
  id: string;
}

async function discoverArrivals(
  orderNo: string,
  maxPosition = 30,
): Promise<{ position: number; arrival?: ArrivalReadDto }[]> {
  const results: { position: number; arrival?: ArrivalReadDto }[] = [];
  for (let position = 1; position <= maxPosition; position++) {
    try {
      await arrivalService.getPending(orderNo, position);
      try {
        const arrival = await arrivalService.get(orderNo, position);
        results.push({ position, arrival });
      } catch {
        results.push({ position });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        if (results.length > 0) break;
      }
    }
  }
  return results;
}

export default function ArrivalsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editArrival, setEditArrival] = useState<ArrivalEntry | null>(null);
  const [deleteArrival, setDeleteArrival] = useState<ArrivalEntry | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number>(1);

  const { data: orders } = useQuery({
    queryKey: ['purchaseorders'],
    queryFn: purchaseOrderService.getAll,
  });

  const filteredOrders =
    user?.roles.includes('Supplier') && user.supplierCode
      ? orders?.filter((o) => o.supplierCode === user.supplierCode)
      : orders;

  const { data: lineData, isLoading } = useQuery({
    queryKey: ['arrival-lines', selectedOrder],
    queryFn: () => discoverArrivals(selectedOrder),
    enabled: !!selectedOrder,
  });

  const createForm = useForm<ArrivalCreateDto>();
  const updateForm = useForm<ArrivalUpdateDto>();

  const createMutation = useMutation({
    mutationFn: ({
      orderNo,
      position,
      dto,
    }: {
      orderNo: string;
      position: number;
      dto: ArrivalCreateDto;
    }) => arrivalService.create(orderNo, position, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arrival-lines', selectedOrder] });
      toast.success('Arrival recorded');
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      orderNo,
      position,
      dto,
    }: {
      orderNo: string;
      position: number;
      dto: ArrivalUpdateDto;
    }) => arrivalService.update(orderNo, position, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arrival-lines', selectedOrder] });
      toast.success('Arrival updated');
      setEditArrival(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ orderNo, position }: { orderNo: string; position: number }) =>
      arrivalService.delete(orderNo, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arrival-lines', selectedOrder] });
      toast.success('Arrival deleted');
      setDeleteArrival(null);
    },
  });

  const openCreate = (position: number) => {
    setSelectedPosition(position);
    createForm.reset({
      orderNumber: selectedOrder,
      position,
      arrivedQuantity: 1,
      arrivalDate: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const openEdit = (entry: ArrivalEntry) => {
    setEditArrival(entry);
    updateForm.reset({
      arrivedQuantity: entry.arrivedQuantity,
      arrivalDate: toInputDate(entry.arrivalDate),
    });
  };

  const arrivals: ArrivalEntry[] =
    lineData
      ?.filter((l) => l.arrival)
      .map((l) => ({
        ...l.arrival!,
        id: `${l.arrival!.orderNumber}-${l.arrival!.position}`,
      })) ?? [];

  return (
    <div>
      <PageHeader
        title="Arrival Tracking"
        subtitle="Monitor and update delivery arrivals"
      />

      <Card className="mb-6">
        <Select
          label="Purchase Order"
          options={[
            { value: '', label: 'Select order...' },
            ...(filteredOrders?.map((o) => ({
              value: o.orderNumber,
              label: `${o.orderNumber} — ${o.supplierCode}`,
            })) ?? []),
          ]}
          value={selectedOrder}
          onChange={(e) => setSelectedOrder(e.target.value)}
        />
      </Card>

      {!selectedOrder ? (
        <Card>
          <EmptyState title="Select a purchase order" description="Choose an order to track arrivals." />
        </Card>
      ) : isLoading ? (
        <Loader />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 font-semibold text-white">Order Lines</h3>
            {!lineData?.length ? (
              <p className="text-sm text-muted">No lines found for this order.</p>
            ) : (
              <div className="space-y-2">
                {lineData.map(({ position, arrival }) => (
                  <div
                    key={position}
                    className="flex items-center justify-between rounded-xl border border-border p-3"
                  >
                    <div>
                      <p className="font-medium text-white">Line {position}</p>
                      {arrival ? (
                        <p className="text-xs text-muted">
                          Arrived: {formatNumber(arrival.arrivedQuantity)} on{' '}
                          {formatDate(arrival.arrivalDate)}
                        </p>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </div>
                    {!arrival ? (
                      <Button size="sm" onClick={() => openCreate(position)}>
                        <MdAdd className="h-4 w-4" /> Record
                      </Button>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            openEdit({
                              ...arrival,
                              id: `${arrival.orderNumber}-${arrival.position}`,
                            })
                          }
                        >
                          <MdEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeleteArrival({
                              ...arrival,
                              id: `${arrival.orderNumber}-${arrival.position}`,
                            })
                          }
                        >
                          <MdDelete className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-4 font-semibold text-white">Arrival Timeline</h3>
            {arrivals.length === 0 ? (
              <p className="text-sm text-muted">No arrivals recorded yet.</p>
            ) : (
              <div className="relative space-y-6 pl-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-border">
                {arrivals.map((a) => (
                  <div key={a.id} className="relative">
                    <div className="absolute -left-4 top-1 h-3 w-3 rounded-full bg-primary" />
                    <p className="font-medium text-white">Line {a.position}</p>
                    <p className="text-sm text-muted">
                      {formatNumber(a.arrivedQuantity)} units arrived
                    </p>
                    <p className="text-xs text-muted">{formatDate(a.arrivalDate)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Arrival">
        <form
          onSubmit={createForm.handleSubmit((d) =>
            createMutation.mutate({
              orderNo: selectedOrder,
              position: selectedPosition,
              dto: {
                ...d,
                orderNumber: selectedOrder,
                position: selectedPosition,
                arrivalDate: d.arrivalDate ? toApiDate(d.arrivalDate as string) : null,
              },
            }),
          )}
          className="space-y-4"
        >
          <Input
            label="Arrived Quantity"
            type="number"
            step="0.01"
            {...createForm.register('arrivedQuantity', { valueAsNumber: true, min: 0.01 })}
          />
          <Input
            label="Arrival Date"
            type="date"
            {...createForm.register('arrivalDate')}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Record
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editArrival} onClose={() => setEditArrival(null)} title="Update Arrival">
        <form
          onSubmit={updateForm.handleSubmit((d) =>
            editArrival &&
            updateMutation.mutate({
              orderNo: editArrival.orderNumber,
              position: editArrival.position,
              dto: { ...d, arrivalDate: toApiDate(d.arrivalDate) },
            }),
          )}
          className="space-y-4"
        >
          <Input
            label="Arrived Quantity"
            type="number"
            step="0.01"
            {...updateForm.register('arrivedQuantity', { valueAsNumber: true, min: 0.01 })}
          />
          <Input label="Arrival Date" type="date" {...updateForm.register('arrivalDate')} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setEditArrival(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={updateMutation.isPending}>
              Update
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteArrival}
        onClose={() => setDeleteArrival(null)}
        onConfirm={() =>
          deleteArrival &&
          deleteMutation.mutate({
            orderNo: deleteArrival.orderNumber,
            position: deleteArrival.position,
          })
        }
        title="Delete Arrival"
        message="Are you sure you want to delete this arrival record?"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
