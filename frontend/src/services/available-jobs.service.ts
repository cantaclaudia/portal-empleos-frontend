import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import { ERROR_CODES, type ErrorCode } from '../constants/error-codes';
import type { Job } from '../types/job.types';
import AuthService from './auth.service';

export type AvailableJob = Job;

interface AvailableJobsResponse {
  code: ErrorCode;
  data: AvailableJob[];
  description: string;
}

class AvailableJobsService {
  async getAvailableJobs(companyId?: number): Promise<AvailableJobsResponse> {
    try {
      const user = AuthService.getUser();

      const body = companyId !== undefined 
      ? { company_id: String(companyId) } 
      : {};

      const response = await apiService.post<AvailableJobsResponse>(
        API_CONFIG.ENDPOINTS.GET_AVAILABLE_JOBS,
        body,
        {
          user_id: String(user?.user_id ?? ''),
        }
      );

      return response;
    } catch (error) {
      console.error('Error en getAvailableJobs:', error);

      return {
        code: ERROR_CODES.INTERNAL_ERROR,
        data: [],
        description: 'Error al cargar los empleos',
      };
    }
  }
}

export default new AvailableJobsService();