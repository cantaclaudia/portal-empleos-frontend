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

export interface CreateCompanyResponse {
  code: string;
  description: string;
  data?: { company_id: number };
}
