import api from './axios';
import type {
  POHeaderCreateDto,
  POHeaderReadDto,
  POHeaderUpdateDto,
  POLineCreateDto,
  POLineReadDto,
  POLineUpdateDto,
} from '@/types';

export const purchaseOrderService = {
  getAll: async (): Promise<POHeaderReadDto[]> => {
    const { data } = await api.get<POHeaderReadDto[]>('/purchaseorders');
    return data;
  },

  getByOrderNo: async (orderNo: string): Promise<POHeaderReadDto> => {
    const { data } = await api.get<POHeaderReadDto>(
      `/purchaseorders/${encodeURIComponent(orderNo)}`,
    );
    return data;
  },

  create: async (dto: POHeaderCreateDto): Promise<POHeaderReadDto> => {
    const { data } = await api.post<POHeaderReadDto>('/purchaseorders', dto);
    return data;
  },

  update: async (orderNo: string, dto: POHeaderUpdateDto): Promise<POHeaderReadDto> => {
    const { data } = await api.put<POHeaderReadDto>(
      `/purchaseorders/${encodeURIComponent(orderNo)}`,
      dto,
    );
    return data;
  },

  getTotal: async (orderNo: string): Promise<number> => {
    const { data } = await api.get<number>(
      `/purchaseorders/${encodeURIComponent(orderNo)}/total`,
    );
    return data;
  },

  addLine: async (orderNo: string, dto: POLineCreateDto): Promise<POLineReadDto> => {
    const { data } = await api.post<POLineReadDto>(
      `/purchaseorders/${encodeURIComponent(orderNo)}/lines`,
      dto,
    );
    return data;
  },

  updateLine: async (
    orderNo: string,
    position: number,
    dto: POLineUpdateDto,
  ): Promise<POLineReadDto> => {
    const { data } = await api.put<POLineReadDto>(
      `/purchaseorders/${encodeURIComponent(orderNo)}/lines/${position}`,
      dto,
    );
    return data;
  },

  deleteLine: async (orderNo: string, position: number): Promise<void> => {
    await api.delete(
      `/purchaseorders/${encodeURIComponent(orderNo)}/lines/${position}`,
    );
  },
};
