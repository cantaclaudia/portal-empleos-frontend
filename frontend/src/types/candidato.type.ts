export interface RegisterCandidateRequest {
  name: string;
  last_name: string;
  email: string;
  password: string;
  resume_url: string;
  skill_list: number[];
}

export interface RegisterCandidateResponse {
  code: string;
  description: string;
}

export interface ApiResponse {
  code: string;
  description: string;
}
