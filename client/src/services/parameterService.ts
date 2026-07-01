import api from './axios';
import type {
  ParameterCreateDto,
  ParameterReadDto,
  ParameterUpdateDto,
} from '@/types';

export const parameterService = {
  getAll: async (): Promise<ParameterReadDto[]> => {
    const { data } = await api.get<ParameterReadDto[]>('/parameters');
    return data;
  },

  getLatest: async (): Promise<ParameterReadDto> => {
    const { data } = await api.get<ParameterReadDto>('/parameters/latest');
    return data;
  },

  getBySeqNo: async (seqNo: number): Promise<ParameterReadDto> => {
    const { data } = await api.get<ParameterReadDto>(`/parameters/${seqNo}`);
    return data;
  },

  create: async (dto: ParameterCreateDto): Promise<ParameterReadDto> => {
    const { data } = await api.post<ParameterReadDto>('/parameters', dto);
    return data;
  },

  update: async (seqNo: number, dto: ParameterUpdateDto): Promise<void> => {
    await api.put(`/parameters/${seqNo}`, dto);
  },
};
