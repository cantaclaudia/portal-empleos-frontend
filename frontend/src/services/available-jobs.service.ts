import { API_CONFIG } from "../config/api.config";
import { ERROR_CODES, type ErrorCode } from "../constants/error-codes";

export interface AvailableJob {
  company_id: number;
  company_name: string;
  job_description: string;
  job_title: string;
  location: string;
  requirements: string;
  salary: string;
}

interface AvailableJobsResponse {
  code: ErrorCode;
  data: AvailableJob[];
  description: string;
}

class AvailableJobsService {
  async getAvailableJobs(): Promise<AvailableJobsResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_AVAILABLE_JOBS}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": API_CONFIG.TOKEN,
            "user_id": "1",
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Respuesta backend:", text);
        return {
          code: ERROR_CODES.INTERNAL_ERROR,
          data: [],
          description: "Error de red",
        };
      }

      const result: AvailableJobsResponse = await response.json();
      return result;
    } catch (err) {
      console.error("Error al cargar empleos:", err);
      return {
        code: ERROR_CODES.INTERNAL_ERROR,
        data: [],
        description: "Error al cargar los empleos",
      };
    }
  }
}

export default new AvailableJobsService();