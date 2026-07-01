import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit } from 'react-icons/md';
import { firstFreeNumberService } from '@/services/firstFreeNumberService';
import { useTableData } from '@/hooks/useTableData';
import { PageHeader } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import type { FirstFreeNumberCreateDto, FirstFreeNumberReadDto } from '@/types';

export default function FirstFreeNumbersPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FirstFreeNumberReadDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['firstfreenumbers'],
    queryFn: firstFreeNumberService.getAll,
  });

  const table = useTableData(data, ['numberGroup', 'description'], 'numberGroup');

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FirstFreeNumberCreateDto>({ defaultValues: { firstFreeNo: 1 } });

  const createMutation = useMutation({
    mutationFn: firstFreeNumberService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firstfreenumbers'] });
      toast.success('Number group created');
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ group, dto }: { group: string; dto: FirstFreeNumberCreateDto }) =>
      firstFreeNumberService.update(group, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firstfreenumbers'] });
      toast.success('Number group updated');
      closeModal();
    },
  });

  const openCreate = () => {
    setEditItem(null);
    reset({ numberGroup: '', description: '', firstFreeNo: 1 });
    setModalOpen(true);
  };

  const openEdit = (item: FirstFreeNumberReadDto) => {
    setEditItem(item);
    reset({
      numberGroup: item.numberGroup,
      description: item.description,
      firstFreeNo: item.firstFreeNo,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
  };

  const onSubmit = (formData: FirstFreeNumberCreateDto) => {
    if (editItem) {
      updateMutation.mutate({ group: editItem.numberGroup, dto: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div>
      <PageHeader
        title="First Free Numbers"
        subtitle="Manage auto-numbering groups"
        actions={
          <Button onClick={openCreate}>
            <MdAdd className="h-4 w-4" /> Add Group
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
            title="No number groups"
            actionLabel="Add Group"
            onAction={openCreate}
          />
        ) : (
          <>
            <Table<FirstFreeNumberReadDto>
              columns={[
                { key: 'numberGroup', header: 'Group', sortable: true },
                { key: 'description', header: 'Description', sortable: true },
                { key: 'firstFreeNo', header: 'First Free No', sortable: true },
                {
                  key: 'numberGroup',
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
              onSort={(k) => table.toggleSort(k as keyof FirstFreeNumberReadDto)}
              keyExtractor={(r) => r.numberGroup}
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
        title={editItem ? 'Edit Number Group' : 'Create Number Group'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Number Group"
            disabled={!!editItem}
            error={errors.numberGroup?.message}
            {...register('numberGroup', { required: 'Required', maxLength: 3 })}
          />
          <Input
            label="Description"
            error={errors.description?.message}
            {...register('description', { required: 'Required', maxLength: 6 })}
          />
          <Input
            label="First Free Number"
            type="number"
            error={errors.firstFreeNo?.message}
            {...register('firstFreeNo', { valueAsNumber: true, required: 'Required', min: 1 })}
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
