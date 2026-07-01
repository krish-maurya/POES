import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit } from 'react-icons/md';
import { parameterService } from '@/services/parameterService';
import { firstFreeNumberService } from '@/services/firstFreeNumberService';
import { useTableData } from '@/hooks/useTableData';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Loader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/utils/format';
import type { ParameterCreateDto, ParameterReadDto, ParameterUpdateDto } from '@/types';

type FormData = ParameterCreateDto;

export default function ParametersPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ParameterReadDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['parameters'],
    queryFn: parameterService.getAll,
  });

  const { data: numberGroups } = useQuery({
    queryKey: ['firstfreenumbers'],
    queryFn: firstFreeNumberService.getAll,
  });

  const table = useTableData(data, ['seqNo', 'createdByLogin'], 'seqNo');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const createMutation = useMutation({
    mutationFn: parameterService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parameters'] });
      toast.success('Parameter created');
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ seqNo, dto }: { seqNo: number; dto: ParameterUpdateDto }) =>
      parameterService.update(seqNo, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parameters'] });
      toast.success('Parameter updated');
      closeModal();
    },
  });

  const openCreate = () => {
    setEditItem(null);
    reset({
      numberGroupSupplier: '',
      numberGroupPurchaseOrder: '',
      createdByLogin: user?.email.split('@')[0] ?? '',
    });
    setModalOpen(true);
  };

  const openEdit = (item: ParameterReadDto) => {
    setEditItem(item);
    reset({
      numberGroupSupplier: item.numberGroupSupplier ?? '',
      numberGroupPurchaseOrder: item.numberGroupPurchaseOrder ?? '',
      createdByLogin: item.createdByLogin,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
  };

  const onSubmit = (formData: FormData) => {
    if (editItem) {
      updateMutation.mutate({
        seqNo: editItem.seqNo,
        dto: {
          numberGroupSupplier: formData.numberGroupSupplier,
          numberGroupPurchaseOrder: formData.numberGroupPurchaseOrder,
        },
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const groupOptions = [
    { value: '', label: 'None' },
    ...(numberGroups?.map((g) => ({
      value: g.numberGroup,
      label: `${g.numberGroup} — ${g.description}`,
    })) ?? []),
  ];

  return (
    <div>
      <PageHeader
        title="System Parameters"
        subtitle="Configure numbering groups and system settings"
        actions={
          <Button onClick={openCreate}>
            <MdAdd className="h-4 w-4" /> New Parameter
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
          className="mb-4 sm:max-w-xs"
        />

        {isLoading ? (
          <Loader />
        ) : !data?.length ? (
          <EmptyState
            title="No parameters configured"
            actionLabel="Create Parameter"
            onAction={openCreate}
          />
        ) : (
          <>
            <Table<ParameterReadDto>
              columns={[
                { key: 'seqNo', header: 'Seq #', sortable: true },
                { key: 'numberGroupSupplier', header: 'Supplier Group', sortable: true },
                { key: 'numberGroupPurchaseOrder', header: 'PO Group', sortable: true },
                { key: 'createdByLogin', header: 'Created By', sortable: true },
                {
                  key: 'creationDate',
                  header: 'Created',
                  render: (r) => formatDateTime(r.creationDate),
                },
                {
                  key: 'seqNo',
                  header: 'Actions',
                  render: (r) => (
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                      <MdEdit className="h-4 w-4" />
                    </Button>
                  ),
                },
              ]}
              data={table.paged}
              sortKey={table.sortKey}
              sortDir={table.sortDir}
              onSort={(k) => table.toggleSort(k as keyof ParameterReadDto)}
              keyExtractor={(r) => String(r.seqNo)}
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
        title={editItem ? 'Edit Parameter' : 'Create Parameter'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editItem && (
            <Input
              label="Created By Login"
              error={errors.createdByLogin?.message}
              {...register('createdByLogin', { required: 'Required', maxLength: 16 })}
            />
          )}
          <Select
            label="Supplier Number Group"
            options={groupOptions}
            {...register('numberGroupSupplier')}
          />
          <Select
            label="Purchase Order Number Group"
            options={groupOptions}
            {...register('numberGroupPurchaseOrder')}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
