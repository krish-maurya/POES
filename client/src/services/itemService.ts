import api from './axios';
import type { ItemCreateDto, ItemReadDto, ItemUpdateDto } from '@/types';

export const itemService = {
  getAll: async (): Promise<ItemReadDto[]> => {
    const { data } = await api.get<ItemReadDto[]>('/items');
    return data;
  },

  getByCode: async (itemCode: string): Promise<ItemReadDto> => {
    const { data } = await api.get<ItemReadDto>(`/items/${encodeURIComponent(itemCode)}`);
    return data;
  },

  getBySupplier: async (supplierCode: string): Promise<ItemReadDto[]> => {
    const { data } = await api.get<ItemReadDto[]>(
      `/items/by-supplier/${encodeURIComponent(supplierCode)}`,
    );
    return data;
  },

  create: async (dto: ItemCreateDto): Promise<ItemReadDto> => {
    const { data } = await api.post<ItemReadDto>('/items', dto);
    return data;
  },

  update: async (itemCode: string, dto: ItemUpdateDto): Promise<void> => {
    await api.put(`/items/${encodeURIComponent(itemCode)}`, dto);
  },

  delete: async (itemCode: string): Promise<void> => {
    await api.delete(`/items/${encodeURIComponent(itemCode)}`);
  },
};
