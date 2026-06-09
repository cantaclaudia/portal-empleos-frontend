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

export interface WorkExperience {
  job_title: string;
  company: string;
  start_date: string;
  end_date: string;
}

export interface Education {
  degree: string;
  institution: string;
  start_date: string;
  end_date: string;
}

export interface CandidateProfileData {
  name: string;
  last_name: string;
  email: string;
  resume_url: string;
  skill_list?: string[];
  job_title?: string;
  bio?: string;
  location?: string;
  age?: number;
  phone?: string;
  linkedin?: string;
  website?: string;
  experience?: WorkExperience[];
  education?: Education[];
}
