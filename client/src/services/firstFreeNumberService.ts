import api from './axios';
import type { FirstFreeNumberCreateDto, FirstFreeNumberReadDto } from '@/types';

export const firstFreeNumberService = {
  getAll: async (): Promise<FirstFreeNumberReadDto[]> => {
    const { data } = await api.get<FirstFreeNumberReadDto[]>('/firstfreenumbers');
    return data;
  },

  getByGroup: async (numberGroup: string): Promise<FirstFreeNumberReadDto> => {
    const { data } = await api.get<FirstFreeNumberReadDto>(
      `/firstfreenumbers/${encodeURIComponent(numberGroup)}`,
    );
    return data;
  },

  create: async (dto: FirstFreeNumberCreateDto): Promise<FirstFreeNumberReadDto> => {
    const { data } = await api.post<FirstFreeNumberReadDto>('/firstfreenumbers', dto);
    return data;
  },

  update: async (numberGroup: string, dto: FirstFreeNumberCreateDto): Promise<void> => {
    await api.put(`/firstfreenumbers/${encodeURIComponent(numberGroup)}`, dto);
  },
};
