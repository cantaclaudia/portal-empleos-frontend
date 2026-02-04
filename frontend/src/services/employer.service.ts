import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import errorHandler from './error-handler.service';
import type { RegisterEmployerRequest, RegisterEmployerResponse } from '../types/employer.types';

class EmployerService {
  async registerEmployer(
    data: RegisterEmployerRequest
  ): Promise<RegisterEmployerResponse> {
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

    try {
      const response = await apiService.post<RegisterEmployerResponse>(
        API_CONFIG.ENDPOINTS.REGISTER_EMPLOYER,
        data
      );

      if (errorHandler.isSuccess(response.code)) {
        return response;
      }

      throw errorHandler.handleApiError(response, 'REGISTER_EMPLOYER');
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }
}

export default new EmployerService();