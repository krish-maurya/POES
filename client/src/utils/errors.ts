import type { AxiosError } from 'axios';
import type { ApiErrorResponse, IdentityError, ValidationProblemDetails } from '@/types';

export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred';

  const axiosError = error as AxiosError<
    ValidationProblemDetails | ApiErrorResponse | IdentityError[]
  >;

  if (axiosError.response?.data) {
    const data = axiosError.response.data;

    if (Array.isArray(data)) {
      return data.map((e) => e.description).join(', ');
    }

    if ('errors' in data && data.errors) {
      return Object.values(data.errors).flat().join(', ');
    }

    if ('error' in data && data.error) {
      return data.error;
    }

    if ('title' in data && data.title) {
      return data.title;
    }
  }

  if (axiosError.message) {
    if (axiosError.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
    if (axiosError.message === 'Network Error') return 'Network error. Check your connection.';
    return axiosError.message;
  }

  return 'An unexpected error occurred';
}
