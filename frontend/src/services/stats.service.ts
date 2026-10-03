import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import errorHandler from './error-handler.service';
import AuthService from './auth.service';
import type { GetStatsResponse, Stats } from '../types/application.types';
import type { ErrorCode } from '../constants/error-codes';
import type { ApiResponse } from './error-handler.service';

const sum = (rows: unknown, key: string): number =>
  Array.isArray(rows)
    ? rows.reduce((acc, row) => acc + (Number((row as Record<string, unknown>)?.[key]) || 0), 0)
    : 0;

const firstNumber = (rows: unknown, key: string): number => {
  const first = Array.isArray(rows) ? rows[0] : undefined;
  const value = (first as Record<string, unknown> | undefined)?.[key];
  return typeof value === 'number' ? value : 0;
};

class StatsService {
  async getStats(): Promise<GetStatsResponse> {
    try {
      const user = AuthService.getUser();
      if (user === null) {
        throw new Error('No hay un usuario autenticado');
      }

      const response = await apiService.post<any>(
        API_CONFIG.ENDPOINTS.GET_STATS,
        {
          total_candidates: true,
          total_companies: true,
          total_job_offers: true,
          successful_job_offers: true,
        },
        { user_id: String(user.user_id) }
      );

      if (!errorHandler.isSuccess(response.code as ErrorCode)) {
        throw errorHandler.handleApiError(response as ApiResponse, 'GET_STATS');
      }

      const raw = response.data ?? response;

      const data: Stats = {
        total_candidates: 0,
        total_companies: firstNumber(raw.total_companies, 'number_of_companies'),
        total_job_offers: sum(raw.total_job_offers, 'sector_count'),
        successful_job_offers: sum(raw.successful_job_offers, 'successful_job_offer_count'),
      };
      

      return { code: response.code, description: response.description, data };
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }

  async getRawStats(): Promise<{
  total_job_offers: Array<{ company_type: string; sector_count: number }>;
  successful_job_offers: Array<{ bussines_sector: string; successful_job_offer_count: number }>;
  total_companies: number;
  total_job_offers_sum: number;
  successful_job_offers_sum: number;
}> {
  const user = AuthService.getUser();
  if (user === null) throw new Error('No hay un usuario autenticado');

  const response = await apiService.post<any>(
    API_CONFIG.ENDPOINTS.GET_STATS,
    {
      total_candidates: true,
      total_companies: true,
      total_job_offers: true,
      successful_job_offers: true,
    },
    { user_id: String(user.user_id) }
  );

  if (!errorHandler.isSuccess(response.code as ErrorCode)) {
    throw errorHandler.handleApiError(response as ApiResponse, 'GET_STATS');
  }

  const raw = response.data ?? response;

  return {
    total_job_offers: Array.isArray(raw.total_job_offers) ? raw.total_job_offers : [],
    successful_job_offers: Array.isArray(raw.successful_job_offers) ? raw.successful_job_offers : [],
    total_companies: firstNumber(raw.total_companies, 'number_of_companies'),
    total_job_offers_sum: sum(raw.total_job_offers, 'sector_count'),
    successful_job_offers_sum: sum(raw.successful_job_offers, 'successful_job_offer_count'),
  };
}
}

export default new StatsService();