import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import errorHandler from './error-handler.service';
import type { GetCandidateProfileResponse } from '../types/candidate-profile.types';
import type { ErrorCode } from '../constants/error-codes';
import type { ApiResponse } from './error-handler.service';

class CandidateProfileService {
  async getCandidateProfile(
    candidateId: string,
    userId: string
  ): Promise<GetCandidateProfileResponse> {
    try {
      const response = await apiService.post<GetCandidateProfileResponse>(
        API_CONFIG.ENDPOINTS.GET_CANDIDATE_PROFILE,
        { candidate_id: candidateId },
        { user_id: userId }
      );

      if (errorHandler.isSuccess(response.code as ErrorCode)) {
        return response;
      }

      throw errorHandler.handleApiError(response as ApiResponse, 'GET_CANDIDATE_PROFILE');
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }
}

export default new CandidateProfileService();