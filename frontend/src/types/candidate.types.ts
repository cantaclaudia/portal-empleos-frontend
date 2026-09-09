export interface RegisterCandidateRequest {
  name: string;
  last_name: string;
  email: string;
  password: string;
  resume_url: string;
  skill_list: string[];
}

export interface RegisterCandidateResponse {
  code: string;
  description: string;
}
