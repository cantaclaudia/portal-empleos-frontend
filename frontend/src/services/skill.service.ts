import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import errorHandler from './error-handler.service';
import type { GetSkillsResponse } from '../types/skill.types';

class SkillService {
  async getSkillsList(): Promise<GetSkillsResponse> {
    try {
      const response = await apiService.post<GetSkillsResponse>(
        API_CONFIG.ENDPOINTS.GET_SKILLS_LIST,
        {}
      );

      if (errorHandler.isSuccess(response.code)) {
        return response;
      }
    
      throw errorHandler.handleApiError(response, 'GET_SKILLS');

    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }
}

export default new SkillService();
