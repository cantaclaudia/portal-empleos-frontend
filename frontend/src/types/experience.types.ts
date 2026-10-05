export interface WorkExperience {
  job_name: string | null;
  company_name: string | null;
  start_date: string | null; // 'YYYY-MM-DD'
  end_date: string | null;   // null = trabajo actual
}