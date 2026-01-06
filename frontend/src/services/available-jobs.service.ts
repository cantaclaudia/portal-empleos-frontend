import { API_CONFIG } from "../config/api.config";

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
  code: string;
  data: AvailableJob[];
  description: string;
}

class AvailableJobsService {
  async getAvailableJobs(): Promise<AvailableJob[]> {
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
      throw new Error(`HTTP ${response.status}`);
    }

    const result: AvailableJobsResponse = await response.json();
    return result.data;
  }
}

export default new AvailableJobsService();
