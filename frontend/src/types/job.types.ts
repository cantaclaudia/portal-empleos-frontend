export interface Job {
  company_id: number;
  company_name: string;
  job_description: string;
  job_title: string;
  location: string;
  requirements: string;
  salary: string;
  job_offer_id?: number;
}

export interface GetAvailableJobsResponse {
  code: string;
  data: Job[];
  description: string;
}

export interface JobType {
  job_id: number;
  name: string;
  description: string;
}

export interface GetJobTypeListResponse {
  code: string;
  data: JobType[];
  description: string;
}

export interface CreateJobOfferRequest {
  company_id: string;
  job_id: string;
  salary: string;
  location: string;
}

export interface CreateJobOfferResponse {
  code: string;
  description: string;
}

export interface CreateNewJobRequest {
  name: string;
  description: string;
  requirements: string;
}

export interface CreateNewJobResponse {
  code: string;
  description: string;
}
