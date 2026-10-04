export interface CandidateExperience {
  job_name: string | null;     // LEFT JOIN: puede venir null
  company_name: string | null; // LEFT JOIN: puede venir null
  start_date: string | null;   // 'YYYY-MM-DD'
  end_date: string | null;
}

export interface CandidateProfile {
  first_name: string;
  last_name: string;
  email: string;
  resume_url: string | null;
  skills: string | null; // "Asertividad,Figma,Liderazgo"
  experience: CandidateExperience[] | null;
}

export interface GetCandidateProfileResponse {
  code: string;
  // Si no se encuentra el candidato el backend responde ok con data = {}
  data: Partial<CandidateProfile>;
  description: string;
}