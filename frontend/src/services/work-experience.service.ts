import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import type {
  UploadWorkExperienceRequest,
  UploadWorkExperienceResponse,
} from '../types/experience.types';

class WorkExperienceService {
  uploadWorkExperience(data: UploadWorkExperienceRequest) {
    return apiService.call<UploadWorkExperienceResponse>(
      API_CONFIG.ENDPOINTS.UPLOAD_WORK_EXPERIENCE,
      'UPLOAD_WORK_EXPERIENCE',
      data
    );
  }
}

export default new WorkExperienceService();