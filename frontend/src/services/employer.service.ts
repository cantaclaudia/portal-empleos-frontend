import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import type {
  RegisterEmployerRequest,
  RegisterEmployerResponse,
  GetEmployerProfileResponse,
} from '../types/employer.types';

const { ENDPOINTS } = API_CONFIG;

class EmployerService {
  registerEmployer(data: RegisterEmployerRequest) {
    if (data.name.length > 20) {
      throw new Error('El nombre no puede exceder 20 caracteres');
    }

    if (data.last_name.length > 20) {
      throw new Error('El apellido no puede exceder 20 caracteres');
    }

    if (data.email.length > 60) {
      throw new Error('El correo electrónico no puede exceder 60 caracteres');
    }

    return apiService.call<RegisterEmployerResponse>(
      ENDPOINTS.REGISTER_EMPLOYER,
      'REGISTER_EMPLOYER',
      data
    );
  }

  getEmployerProfile() {
    return apiService.call<GetEmployerProfileResponse>(
      ENDPOINTS.GET_EMPLOYER_PROFILE,
      'GET_EMPLOYER_PROFILE'
    );
  }
}

export default new EmployerService();