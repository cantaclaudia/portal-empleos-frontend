import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import errorHandler from './error-handler.service';
import type { RegisterCandidateRequest } from '../types/candidate.types';
import type { ApiResponse } from './error-handler.service';

class CandidateService {
  async registerCandidate(
    data: RegisterCandidateRequest
  ): Promise<void> {

    if (data.name.length > 20) {
      throw new Error('El nombre no puede exceder 20 caracteres');
    }
    if (data.last_name.length > 20) {
      throw new Error('El apellido no puede exceder 20 caracteres');
    }
    if (data.email.length > 60) {
      throw new Error('El correo electrónico no puede exceder 60 caracteres');
    }
    if (data.password.length > 30) {
      throw new Error('La contraseña no puede exceder 30 caracteres');
    }
    if (data.resume_url.length > 100) {
      throw new Error('La URL del currículum no puede exceder 100 caracteres');
    }

    try {
      const response = await apiService.post<ApiResponse>(
        API_CONFIG.ENDPOINTS.REGISTER_CANDIDATE,
        data
      );

      if (errorHandler.isSuccess(response.code)) {
        return;
      }

      errorHandler.handleApiError(response, 'REGISTER_CANDIDATE');

    } catch (error) {
      errorHandler.wrapConnectionError(error);
    }
  }
}

export default new CandidateService();
