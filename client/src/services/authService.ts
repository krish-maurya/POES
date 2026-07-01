import api from './axios';
import type { LoginDto, LoginResponse, RegisterDto, RegisterResponse } from '@/types';

export const authService = {
  login: async (dto: LoginDto): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', dto);
    return data;
  },

  register: async (dto: RegisterDto): Promise<RegisterResponse> => {
    const { data } = await api.post<RegisterResponse>('/auth/register', dto);
    return data;
  },
};
