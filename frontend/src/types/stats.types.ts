export interface StatsResponse {
  code: string;
  description: string;
  data?: {
    total_companies?: { number_of_companies?: number }[];
    total_job_offers?: {
      number_of_job_offers?: number;
      business_sector?: Record<string, number>;
    };
    successful_job_offers?: {
      number_of_successful_job_offers?: number;
      business_sector?: Record<string, number>;
    };
  };
}

export interface AdminStats {
  totalCompanies: number;
  totalOffers: number;
  totalSuccess: number;
  offersBySector: Record<string, number>;
  successBySector: Record<string, number>;
}