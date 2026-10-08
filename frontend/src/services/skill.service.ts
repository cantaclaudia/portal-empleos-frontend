import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import type { GetSkillsResponse } from '../types/skill.types';

class SkillService {
  getSkillsList() {
    return apiService.call<GetSkillsResponse>(
      API_CONFIG.ENDPOINTS.GET_SKILLS_LIST,
      'GET_SKILLS'
    );
  }
}

export default new SkillService();