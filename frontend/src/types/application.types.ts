import type { WorkExperience } from './experience.types';

export interface Application {
  application_id: number;
  job_title: string;
  application_date: string;
  candidate_id: number;
  company_name?: string;
  job_offer_id: number;
  company_id: number;
  job_description: string;
  requirements: string;
  salary: string;
  location: string;
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

export interface ApplicantInfo {
  candidate_id: number;
  email: string;
  first_name: string;
  last_name: string;
  resume_url: string;
  skills: string | null; // "React,Node.js,Git"
  experience: WorkExperience[] | null;
}

export interface GetApplicantsInformationRequest {
  job_offer_id: string;
}

export interface GetApplicantsInformationResponse {
  code: string;
  description: string;
  data: ApplicantInfo[];
}
