import { API_CONFIG } from "../config/api.config";
import { apiService } from './api.service';

export interface AvailableJob {
  company_id: number;
  company_name: string;
  job_title: string;
  job_description: string;
  location: string;
  requirements: string;
  salary: string;
}

interface AvailableJobsResponse {
  code: string;
  description: string;
  data: AvailableJob[];
}

class AvailableJobsService {
  // Obtener todos los trabajos disponibles o filtrados por company_id
  async getAvailableJobs(company_id?: number): Promise<AvailableJob[]> {
    try {
      const body = company_id ? { company_id } : {};
      const response = await apiService.post<AvailableJobsResponse>(
        API_CONFIG.ENDPOINTS.GET_AVAILABLE_JOBS,
        body
      );

      if (response.code === '0200') {
        return response.data;
      } else {
        throw new Error(response.description || 'Error al obtener trabajos');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión. Verifica tu conexión a internet');
    }
  }
}

export default new AvailableJobsService();