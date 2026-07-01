import api from './axios';
import type { SupplierCreateDto, SupplierReadDto, SupplierUpdateDto } from '@/types';

export const supplierService = {
  getAll: async (): Promise<SupplierReadDto[]> => {
    const { data } = await api.get<SupplierReadDto[]>('/suppliers');
    return data;
  },

  getByCode: async (supplierCode: string): Promise<SupplierReadDto> => {
    const { data } = await api.get<SupplierReadDto>(
      `/suppliers/${encodeURIComponent(supplierCode)}`,
    );
    return data;
  },

  create: async (dto: SupplierCreateDto): Promise<SupplierReadDto> => {
    const { data } = await api.post<SupplierReadDto>('/suppliers', dto);
    return data;
  },

  update: async (supplierCode: string, dto: SupplierUpdateDto): Promise<void> => {
    await api.put(`/suppliers/${encodeURIComponent(supplierCode)}`, dto);
  },

  delete: async (supplierCode: string): Promise<void> => {
    await api.delete(`/suppliers/${encodeURIComponent(supplierCode)}`);
  },
};
