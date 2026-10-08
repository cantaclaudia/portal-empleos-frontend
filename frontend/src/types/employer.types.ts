export interface RegisterEmployerRequest {
  name: string;
  last_name: string;
  email: string;
  password: string;
  company_id: number;
}

export interface RegisterEmployerResponse {
  code: string;
  description: string;
}

export interface Company {
  company_id: number;
  name: string;
}

export interface GetCompaniesResponse {
  code: string;
  data: Company[];
  description: string;
}

export interface CreateCompanyRequest {
  name: string;
  description: string;
  tax_id: string;
}

export interface CreateCompanyRequest {
  name: string;
  description: string;
  tax_id: string;
  company_type: number; 
}

export interface EmployerProfile {
  first_name: string;
  last_name: string;
  email: string;
  company_id: number;
  company_name: string;
  company_description: string | null;
  company_sector: string | null;
  total_job_offers: number;
  total_applications: number;
}

export interface GetEmployerProfileResponse {
  code: string;
  data: EmployerProfile;
  description: string;
}