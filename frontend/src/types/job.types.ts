export interface Job {
  company_id: number;
  company_name: string;
  job_description: string;
  job_title: string;
  location: string;
  requirements: string;
  salary: string;
}

export interface GetAvailableJobsResponse {
  code: string;
  data: Job[];
  description: string;
}
