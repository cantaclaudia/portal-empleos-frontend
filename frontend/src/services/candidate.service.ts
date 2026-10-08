import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import type {
  RegisterCandidateRequest,
  RegisterCandidateResponse,
} from '../types/candidate.types';

class CandidateService {
  async registerCandidate(data: RegisterCandidateRequest) {
    if (data.name.length > 20) {
      throw new Error('El nombre no puede exceder 20 caracteres');
    }

    if (data.last_name.length > 20) {
      throw new Error('El apellido no puede exceder 20 caracteres');
    }

    if (data.email.length > 60) {
      throw new Error('El correo electrónico no puede exceder 60 caracteres');
    }

    if (data.resume_url.length > 100) {
      throw new Error('La URL del currículum no puede exceder 100 caracteres');
    }

    return apiService.call<RegisterCandidateResponse>(
      API_CONFIG.ENDPOINTS.REGISTER_CANDIDATE,
      'REGISTER_CANDIDATE',
      data
    );
  }
}

export default new CandidateService();