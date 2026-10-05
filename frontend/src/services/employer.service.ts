import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import errorHandler from './error-handler.service';
import type {
  RegisterEmployerRequest,
  RegisterEmployerResponse,
  GetEmployerProfileResponse,
} from '../types/employer.types';
import type { ErrorCode } from '../constants/error-codes';
import type { ApiResponse } from './error-handler.service';

class EmployerService {
  async registerEmployer(data: RegisterEmployerRequest): Promise<RegisterEmployerResponse> {
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

      if (errorHandler.isSuccess(response.code as ErrorCode)) {
        return response;
      }

      throw errorHandler.handleApiError(response as ApiResponse, 'REGISTER_EMPLOYER');
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }

  async getEmployerProfile(userId: string): Promise<GetEmployerProfileResponse> {
    try {
      const response = await apiService.post<GetEmployerProfileResponse>(
        API_CONFIG.ENDPOINTS.GET_EMPLOYER_PROFILE,
        {},
        {
          user_id: userId,
        }
      );

      if (errorHandler.isSuccess(response.code as ErrorCode)) {
        return response;
      }

      throw errorHandler.handleApiError(response as ApiResponse, 'GET_EMPLOYER_PROFILE');
    } catch (error) {
      throw errorHandler.wrapConnectionError(error);
    }
  }
}

export default new EmployerService();