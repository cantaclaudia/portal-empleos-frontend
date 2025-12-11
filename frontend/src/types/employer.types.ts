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
  id: number;
  name: string;
}
