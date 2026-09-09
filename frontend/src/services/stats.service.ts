import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import errorHandler from './error-handler.service';
import type { GetStatsResponse } from '../types/application.types';
import type { ErrorCode } from '../constants/error-codes';
import type { ApiResponse } from './error-handler.service';

class StatsService {
  async getStats(): Promise<GetStatsResponse> {
    try {
      const response = await apiService.post<GetStatsResponse>(
        API_CONFIG.ENDPOINTS.GET_STATS,
        {}
      );

      if (errorHandler.isSuccess(response.code as ErrorCode)) {
        return response;
      }

      throw errorHandler.handleApiError(response as ApiResponse, 'GET_STATS');
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }
}

export default new StatsService();
