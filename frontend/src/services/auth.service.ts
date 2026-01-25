import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import errorHandler from './error-handler.service';
import type { LoginRequest, UserData, ApiResponse } from '../types/auth.types';
import type { ErrorCode } from '../constants/error-codes';

const USER_STORAGE_KEY = 'portal_empleos_user';

class AuthService {
  async login(email: string, password: string): Promise<UserData> {
    if (email.length > 50) {
      throw new Error('El correo electrónico no puede exceder 50 caracteres');
    }

    if (password.length > 30) {
      throw new Error('La contraseña no puede exceder 30 caracteres');
    }

    try {
      const loginData: LoginRequest = { email, password };

      const response: ApiResponse<UserData> = await apiService.post(
        API_CONFIG.ENDPOINTS.LOGIN,
        loginData
      );

      if (!errorHandler.isSuccess(response.code as ErrorCode)) {
        errorHandler.handleApiError(response, 'LOGIN');
      }

      return response.data;

    } catch (error) {
      throw errorHandler.wrapConnectionError(error); 
    }
  }

  saveUser(userData: UserData): void {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  }

  getUser(): UserData | null {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  logout(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return this.getUser() !== null;
  }
}

export default new AuthService();