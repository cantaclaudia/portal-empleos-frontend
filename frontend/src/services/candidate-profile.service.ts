import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import type { GetCandidateProfileResponse } from '../types/candidate-profile.types';

class CandidateProfileService {
  getCandidateProfile(candidateId: string) {
    return apiService.call<GetCandidateProfileResponse>(
      API_CONFIG.ENDPOINTS.GET_CANDIDATE_PROFILE,
      'GET_CANDIDATE_PROFILE',
      { candidate_id: candidateId }
    );
  }
}

export default new CandidateProfileService();