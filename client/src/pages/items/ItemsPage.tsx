import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import { itemService } from '@/services/itemService';
import { supplierService } from '@/services/supplierService';
import { useAuth } from '@/hooks/useAuth';
import { useTableData } from '@/hooks/useTableData';
import { PageHeader } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Loader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { PACKING_TYPE_LABELS } from '@/constants';
import { formatCurrency, formatNumber } from '@/utils/format';
import { PackingType, type ItemCreateDto, type ItemReadDto, type ItemUpdateDto } from '@/types';

type FormData = ItemCreateDto;

export default function ItemsPage() {
  const queryClient = useQueryClient();
  const { user, isCompanyOrAdmin } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<ItemReadDto | null>(null);
  const [editItem, setEditItem] = useState<ItemReadDto | null>(null);
  const [deleteItem, setDeleteItem] = useState<ItemReadDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () =>
      user?.roles.includes('Supplier') && user.supplierCode
        ? itemService.getBySupplier(user.supplierCode)
        : itemService.getAll(),
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierService.getAll,
    enabled: isCompanyOrAdmin(),
  });

  const table = useTableData(data, ['itemCode', 'description', 'supplierCode'], 'itemCode');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { packing: PackingType.No, grossWeight: 0, netWeight: 0, price: 0 },
  });

  const createMutation = useMutation({
    mutationFn: itemService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item created');
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ code, dto }: { code: string; dto: ItemUpdateDto }) =>
      itemService.update(code, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item updated');
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: itemService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item deleted');
      setDeleteItem(null);
    },
  });

  const openCreate = () => {
    setEditItem(null);
    reset({
      itemCode: '',
      description: '',
      variety: '',
      packing: PackingType.No,
      grossWeight: 0,
      netWeight: 0,
      supplierCode: user?.supplierCode ?? '',
      price: 0,
      itemText: '',
    });
    setModalOpen(true);
  };

  const openEdit = (item: ItemReadDto) => {
    setEditItem(item);
    reset({
      itemCode: item.itemCode,
      description: item.description,
      variety: item.variety ?? '',
      packing: item.packing,
      grossWeight: item.grossWeight,
      netWeight: item.netWeight,
      supplierCode: item.supplierCode ?? '',
      price: item.price,
      itemText: item.itemText ?? '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
  };

  const onSubmit = (formData: FormData) => {
    if (editItem) {
      const { itemCode: _, ...updateDto } = formData;
      updateMutation.mutate({ code: editItem.itemCode, dto: updateDto });
    } else {
      createMutation.mutate(formData);
    }
  };

  const packing = watch('packing');

  return (
    <div>
      <PageHeader
        title="Inventory Master"
        subtitle="Manage product catalog and inventory"
        actions={
          isCompanyOrAdmin() && (
            <Button onClick={openCreate}>
              <MdAdd className="h-4 w-4" /> Add Item
            </Button>
          )
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            value={table.search}
            onChange={(v) => {
              table.setSearch(v);
              table.setPage(1);
            }}
            placeholder="Search items..."
            className="sm:max-w-xs"
          />
        </div>

        {isLoading ? (
          <Loader />
        ) : !data?.length ? (
          <EmptyState
            title="No items found"
            description="Get started by adding your first inventory item."
            actionLabel={isCompanyOrAdmin() ? 'Add Item' : undefined}
            onAction={isCompanyOrAdmin() ? openCreate : undefined}
          />
        ) : (
          <>
            <Table<ItemReadDto>
              columns={[
                {
                  key: 'itemCode',
                  header: 'Item',
                  sortable: true,
                  render: (r) => (
                    <div>
                      <p className="font-medium">{r.description}</p>
                      <p className="text-xs text-muted">{r.itemCode}</p>
                    </div>
                  ),
                },
                { key: 'supplierCode', header: 'Supplier', sortable: true },
                {
                  key: 'packing',
                  header: 'Packing',
                  render: (r) => PACKING_TYPE_LABELS[r.packing],
                },
                {
                  key: 'inventoryOnHand',
                  header: 'On Hand',
                  sortable: true,
                  render: (r) => formatNumber(r.inventoryOnHand),
                },
                {
                  key: 'price',
                  header: 'Price',
                  sortable: true,
                  render: (r) => formatCurrency(r.price),
                },
                {
                  key: 'inventoryOnHand',
                  header: 'Status',
                  render: (r) => (
                    <Badge variant={r.inventoryOnHand <= 0 ? 'danger' : 'success'}>
                      {r.inventoryOnHand <= 0 ? 'Out of Stock' : 'Active'}
                    </Badge>
                  ),
                },
                {
                  key: 'itemCode',
                  header: 'Actions',
                  render: (r) => (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => setViewItem(r)}>
                        <MdVisibility className="h-4 w-4" />
                      </Button>
                      {isCompanyOrAdmin() && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                            <MdEdit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteItem(r)}>
                            <MdDelete className="h-4 w-4 text-danger" />
                          </Button>
                        </>
                      )}
                    </div>
                  ),
                },
              ]}
              data={table.paged}
              sortKey={table.sortKey}
              sortDir={table.sortDir}
              onSort={(k) => table.toggleSort(k as keyof ItemReadDto)}
              keyExtractor={(r) => r.itemCode}
            />
            <Pagination
              className="mt-4"
              page={table.page}
              totalPages={table.totalPages}
              total={table.total}
              onPageChange={table.setPage}
            />
          </>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editItem ? 'Edit Item' : 'Create Item'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          {!editItem && (
            <Input
              label="Item Code"
              error={errors.itemCode?.message}
              {...register('itemCode', { required: 'Required' })}
            />
          )}
          <Input
            label="Description"
            error={errors.description?.message}
            {...register('description', { required: 'Required' })}
          />
          <Input label="Variety" {...register('variety')} />
          <Select
            label="Packing"
            options={[
              { value: PackingType.No, label: 'No' },
              { value: PackingType.Yes, label: 'Yes' },
            ]}
            {...register('packing', { valueAsNumber: true })}
          />
          <Input
            label="Gross Weight"
            type="number"
            step="0.01"
            {...register('grossWeight', { valueAsNumber: true, min: 0 })}
          />
          <Input
            label="Net Weight"
            type="number"
            step="0.01"
            {...register('netWeight', { valueAsNumber: true, min: 0 })}
          />
          {isCompanyOrAdmin() ? (
            <Select
              label="Supplier"
              options={[
                { value: '', label: 'Select...' },
                ...(suppliers?.map((s) => ({
                  value: s.supplierCode,
                  label: `${s.supplierCode} — ${s.description}`,
                })) ?? []),
              ]}
              error={errors.supplierCode?.message}
              {...register('supplierCode', { required: 'Required' })}
            />
          ) : (
            <Input label="Supplier Code" disabled {...register('supplierCode')} />
          )}
          <Input
            label="Price"
            type="number"
            step="0.01"
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true, required: 'Required', min: 0.01 })}
          />
          <div className="sm:col-span-2">
            <Textarea label="Item Text" {...register('itemText')} />
          </div>
          {packing === PackingType.No && (
            <p className="sm:col-span-2 text-xs text-muted">
              When packing is No, net weight must equal gross weight.
            </p>
          )}
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Item Details" size="md">
        {viewItem && (
          <dl className="grid gap-3 sm:grid-cols-2">
            {Object.entries({
              'Item Code': viewItem.itemCode,
              Description: viewItem.description,
              Variety: viewItem.variety ?? '—',
              Packing: PACKING_TYPE_LABELS[viewItem.packing],
              'Gross Weight': formatNumber(viewItem.grossWeight),
              'Net Weight': formatNumber(viewItem.netWeight),
              Supplier: viewItem.supplierCode ?? '—',
              Price: formatCurrency(viewItem.price),
              'On Hand': formatNumber(viewItem.inventoryOnHand),
              'On Order': formatNumber(viewItem.inventoryOnOrder),
              Allocated: formatNumber(viewItem.inventoryAllocated),
            }).map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted">{k}</dt>
                <dd className="text-sm text-white">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.itemCode)}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteItem?.description}"?`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
