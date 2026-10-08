import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import type { StatsResponse, AdminStats } from '../types/stats.types';

class StatsService {
  async getAdminStats(): Promise<AdminStats> {
    const res = await apiService.call<StatsResponse>(
      API_CONFIG.ENDPOINTS.GET_STATS,
      'GET_STATS',
      {
        total_companies: true,
        total_job_offers: true,
        successful_job_offers: true,
      }
    );

    const d = res.data ?? {};

    return {
      totalCompanies: Number(d.total_companies?.[0]?.number_of_companies) || 0,
      totalOffers: Number(d.total_job_offers?.number_of_job_offers) || 0,
      totalSuccess:
        Number(d.successful_job_offers?.number_of_successful_job_offers) || 0,
      offersBySector: d.total_job_offers?.business_sector ?? {},
      successBySector: d.successful_job_offers?.business_sector ?? {},
    };
  }
}

export default new StatsService();