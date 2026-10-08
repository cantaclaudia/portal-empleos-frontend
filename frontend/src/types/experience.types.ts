export interface WorkExperience {
  job_name: string | null;
  company_name: string | null;
  start_date: string | null; // 'YYYY-MM-DD'
  end_date: string | null;   // null = trabajo actual
}

export interface UploadWorkExperienceRequest {
  candidate_id: string;
  job_id: string;
  company_id: string;
  start_date: string;       // 'AAAA-MM-DD'
  end_date: string | null;  // null = sigue en el puesto
}

export interface UploadWorkExperienceResponse {
  code: string;
  description: string;
}