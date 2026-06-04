import { API_CONFIG } from '../config/api.config';
import { ERROR_CODES, type ErrorCode } from '../constants/error-codes';

export interface AvailableJob {
  company_id: number;
  company_name: string;
  job_description: string;
  job_title: string;
  location: string;
  requirements: string;
  salary: string;
  job_offer_id?: string;
}

interface AvailableJobsResponse {
  code: ErrorCode;
  data: AvailableJob[];
  description: string;
}

export interface ApplyForJobResponse {
  code: ErrorCode;
  description: string;
  data?: { application_id?: string | number };
}

export interface ApplicationStatusData {
  application_date: string;
  status: number;
  status_description: string;
}

interface ApplicationStatusResponse {
  code: ErrorCode;
  description: string;
  data?: ApplicationStatusData;
}

class AvailableJobsService {
  async getAvailableJobs(): Promise<AvailableJobsResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_AVAILABLE_JOBS}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': API_CONFIG.TOKEN,
            'user_id': '1',
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        return { code: ERROR_CODES.INTERNAL_ERROR, data: [], description: 'Error de red' };
      }

      return await response.json();
    } catch (err) {
      console.error('Error al cargar empleos:', err);
      return { code: ERROR_CODES.INTERNAL_ERROR, data: [], description: 'Error al cargar los empleos' };
    }
  }

  async applyForAJob(jobOfferId: string, candidateId: string): Promise<ApplyForJobResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPLY_FOR_JOB}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': API_CONFIG.TOKEN,
            'user_id': '1',
          },
          body: JSON.stringify({ job_offer_id: jobOfferId, candidate_id: candidateId }),
        }
      );

      if (!response.ok) {
        return { code: ERROR_CODES.INTERNAL_ERROR, description: 'Error al postularse' };
      }

      return await response.json();
    } catch (err) {
      console.error('Error al postularse:', err);
      return { code: ERROR_CODES.INTERNAL_ERROR, description: 'Error al postularse' };
    }
  }

  async getApplicationStatus(applicationId: string): Promise<ApplicationStatusResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_APPLICATION_STATUS}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': API_CONFIG.TOKEN,
            'user_id': '1',
          },
          body: JSON.stringify({ application_id: applicationId }),
        }
      );

      if (!response.ok) {
        return { code: ERROR_CODES.INTERNAL_ERROR, description: 'Error al consultar estado' };
      }

      return await response.json();
    } catch (err) {
      console.error('Error al consultar estado:', err);
      return { code: ERROR_CODES.INTERNAL_ERROR, description: 'Error al consultar estado' };
    }
  }
}

export default new AvailableJobsService();
