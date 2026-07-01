import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import { supplierService } from '@/services/supplierService';
import { useTableData } from '@/hooks/useTableData';
import { PageHeader } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import type { SupplierCreateDto, SupplierReadDto, SupplierUpdateDto } from '@/types';

type FormData = SupplierCreateDto & { supplierCode?: string };

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<SupplierReadDto | null>(null);
  const [editItem, setEditItem] = useState<SupplierReadDto | null>(null);
  const [deleteItem, setDeleteItem] = useState<SupplierReadDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierService.getAll,
  });

  const table = useTableData(data, ['supplierCode', 'description', 'country'], 'supplierCode');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const createMutation = useMutation({
    mutationFn: supplierService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier created');
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ code, dto }: { code: string; dto: SupplierUpdateDto }) =>
      supplierService.update(code, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier updated');
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: supplierService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier deleted');
      setDeleteItem(null);
    },
  });

  const openCreate = () => {
    setEditItem(null);
    reset({ description: '', address: '', zipCode: '', town: '', country: '', phone: '', fax: '' });
    setModalOpen(true);
  };

  const openEdit = (item: SupplierReadDto) => {
    setEditItem(item);
    reset({
      description: item.description,
      address: item.address ?? '',
      zipCode: item.zipCode ?? '',
      town: item.town ?? '',
      country: item.country ?? '',
      phone: item.phone ?? '',
      fax: item.fax ?? '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
  };

  const onSubmit = (formData: FormData) => {
    if (editItem) {
      updateMutation.mutate({ code: editItem.supplierCode, dto: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div>
      <PageHeader
        title="Strategic Supplier Directory"
        subtitle="Manage supplier relationships and contacts"
        actions={
          <Button onClick={openCreate}>
            <MdAdd className="h-4 w-4" /> Add Supplier
          </Button>
        }
      />

      <Card>
        <SearchBar
          value={table.search}
          onChange={(v) => {
            table.setSearch(v);
            table.setPage(1);
          }}
          placeholder="Search suppliers..."
          className="mb-4 sm:max-w-xs"
        />

        {isLoading ? (
          <Loader />
        ) : !data?.length ? (
          <EmptyState
            title="No suppliers found"
            description="Add your first supplier to get started."
            actionLabel="Add Supplier"
            onAction={openCreate}
          />
        ) : (
          <>
            <Table<SupplierReadDto>
              columns={[
                {
                  key: 'supplierCode',
                  header: 'Supplier',
                  sortable: true,
                  render: (r) => (
                    <div>
                      <p className="font-medium">{r.description}</p>
                      <p className="text-xs text-muted">{r.supplierCode}</p>
                    </div>
                  ),
                },
                { key: 'town', header: 'Town', sortable: true },
                { key: 'country', header: 'Region', sortable: true },
                { key: 'phone', header: 'Phone' },
                {
                  key: 'supplierCode',
                  header: 'Actions',
                  render: (r) => (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => setViewItem(r)}>
                        <MdVisibility className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                        <MdEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteItem(r)}>
                        <MdDelete className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={table.paged}
              sortKey={table.sortKey}
              sortDir={table.sortDir}
              onSort={(k) => table.toggleSort(k as keyof SupplierReadDto)}
              keyExtractor={(r) => r.supplierCode}
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
        title={editItem ? 'Edit Supplier' : 'Create Supplier'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Description"
            className="sm:col-span-2"
            error={errors.description?.message}
            {...register('description', { required: 'Required' })}
          />
          <Input label="Address" {...register('address')} />
          <Input label="Zip Code" {...register('zipCode')} />
          <Input label="Town" {...register('town')} />
          <Input
            label="Country (3-letter code)"
            error={errors.country?.message}
            {...register('country', { required: 'Required', maxLength: 3 })}
          />
          <Input label="Phone" {...register('phone')} />
          <Input label="Fax" {...register('fax')} />
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Supplier Details">
        {viewItem && (
          <dl className="grid gap-3 sm:grid-cols-2">
            {Object.entries({
              Code: viewItem.supplierCode,
              Description: viewItem.description,
              Address: viewItem.address ?? '—',
              'Zip Code': viewItem.zipCode ?? '—',
              Town: viewItem.town ?? '—',
              Country: viewItem.country ?? '—',
              Phone: viewItem.phone ?? '—',
              Fax: viewItem.fax ?? '—',
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
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.supplierCode)}
        title="Delete Supplier"
        message={`Delete supplier "${deleteItem?.description}"?`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
