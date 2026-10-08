import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import type { Job, GetAvailableJobsResponse } from '../types/job.types';

export type AvailableJob = Job;

class AvailableJobsService {
  getAvailableJobs(companyId?: number) {
    return apiService.call<GetAvailableJobsResponse>(
      API_CONFIG.ENDPOINTS.GET_AVAILABLE_JOBS,
      'GET_AVAILABLE_JOBS',
      companyId !== undefined ? { company_id: String(companyId) } : {}
    );
  }
}

export default new AvailableJobsService();