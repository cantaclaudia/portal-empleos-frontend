import type { WorkExperience } from './experience.types';

export interface CandidateProfile {
  first_name: string;
  last_name: string;
  email: string;
  resume_url: string | null;
  skills: string | null; // "Asertividad,Figma,Liderazgo"
  experience: WorkExperience[] | null;
}

export interface GetCandidateProfileResponse {
  code: string;
  // Si no se encuentra el candidato el backend responde ok con data = {}
  data: Partial<CandidateProfile>;
  description: string;
}