import { API_CONFIG } from "../config/api.config";

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
  async getAvailableJobs(): Promise<AvailableJob[]> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_AVAILABLE_JOBS}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: API_CONFIG.TOKEN,
        },
        body: JSON.stringify({}), 
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: AvailableJobsResponse = await response.json();

    if (!result.data || !Array.isArray(result.data)) {
      return [];
    }

    return result.data;
  }
}

export default new AvailableJobsService();
