import api from './axios';
import type {
  ArrivalCreateDto,
  ArrivalReadDto,
  ArrivalUpdateDto,
  PendingQuantityResponse,
} from '@/types';

export const arrivalService = {
  get: async (orderNo: string, position: number): Promise<ArrivalReadDto> => {
    const { data } = await api.get<ArrivalReadDto>(
      `/purchaseorders/${encodeURIComponent(orderNo)}/lines/${position}/arrivals`,
    );
    return data;
  },

  getPending: async (orderNo: string, position: number): Promise<PendingQuantityResponse> => {
    const { data } = await api.get<PendingQuantityResponse>(
      `/purchaseorders/${encodeURIComponent(orderNo)}/lines/${position}/arrivals/pending`,
    );
    return data;
  },

  create: async (
    orderNo: string,
    position: number,
    dto: ArrivalCreateDto,
  ): Promise<ArrivalReadDto> => {
    const { data } = await api.post<ArrivalReadDto>(
      `/purchaseorders/${encodeURIComponent(orderNo)}/lines/${position}/arrivals`,
      dto,
    );
    return data;
  },

  update: async (
    orderNo: string,
    position: number,
    dto: ArrivalUpdateDto,
  ): Promise<void> => {
    await api.put(
      `/purchaseorders/${encodeURIComponent(orderNo)}/lines/${position}/arrivals`,
      dto,
    );
  },

  delete: async (orderNo: string, position: number): Promise<void> => {
    await api.delete(
      `/purchaseorders/${encodeURIComponent(orderNo)}/lines/${position}/arrivals`,
    );
  },
};
