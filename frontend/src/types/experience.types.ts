export interface WorkExperience {
  job_name: string | null;
  company_name: string | null;
  description?: string | null; // las filas viejas pueden no tenerla
  start_date: string | null;
  end_date: string | null;
}

export interface UploadWorkExperienceRequest {
  candidate_id: string;
  job_name: string;
  company_name: string;
  description: string;
  start_date: string;       // 'AAAA-MM-DD'
  end_date: string | null;  // null = sigue en el puesto
}

export interface UploadWorkExperienceResponse {
  code: string;
  description: string;
}