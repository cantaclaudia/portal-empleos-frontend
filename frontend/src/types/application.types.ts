export interface Application {
  application_id: number;
  job_title: string;
  application_date: string;
  company_name?: string;
}

export interface GetUserApplicationsRequest {
  candidate_id: string;
}

export interface GetUserApplicationsResponse {
  code: string;
  description: string;
  data: Application[];
}

export interface GetApplicationStatusRequest {
  application_id: string;
}

export interface ApplicationStatus {
  application_date: string;
  status: number;
  status_description: string;
}

export interface GetApplicationStatusResponse {
  code: string;
  description: string;
  data: ApplicationStatus;
}

export interface GetApplicationsWithCompanyIdRequest {
  company_id: string;
}

export interface GetApplicationsWithCompanyIdResponse {
  code: string;
  description: string;
  data: Application[];
}

export interface ApplyForJobRequest {
  job_offer_id: string;
  candidate_id: string;
}

export interface ApplyForJobResponse {
  code: string;
  description: string;
}

export interface ChangeApplicationStatusRequest {
  application_id: string;
  new_status: string;
}

export interface ChangeApplicationStatusResponse {
  code: string;
  description: string;
}

export interface ApplicantExperience {
  company_name: string;
  end_date: string;
  job_name: string;
  start_date: string;
}

export interface ApplicantInfo {
  email: string;
  first_name: string;
  last_name: string;
  resume_url: string;
  skills: string[];
  experience: ApplicantExperience[];
}

export interface GetApplicantsInformationRequest {
  job_offer_id: string;
}

export interface GetApplicantsInformationResponse {
  code: string;
  description: string;
  data: ApplicantInfo[];
}

export interface Stats {
  total_candidates: number;
  total_companies: number;
  total_job_offers: number;
  successful_job_offers: number;
}

export interface GetStatsResponse {
  code: string;
  description: string;
  data: Stats;
}
