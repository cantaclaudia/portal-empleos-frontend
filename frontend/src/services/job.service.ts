import { apiService } from './api.service';
import type { GetAvailableJobsResponse } from '../types/job.types';

class JobService {
  async getAvailableJobs(): Promise<GetAvailableJobsResponse> {
    try {
      const response = await apiService.post<GetAvailableJobsResponse>(
        '/v1/getAvailableJobs',
        {}
      );

      if (response.code !== '0200') {
        throw new Error(response.description || 'Error al obtener trabajos');
      }

      return response;
    } catch (error) {
      console.error('Error getting available jobs:', error);
      throw error;
    }
  }
}

export default new JobService();
