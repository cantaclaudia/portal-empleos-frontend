import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import errorHandler from './error-handler.service';
import type { LoginRequest, UserData, ApiResponse } from '../types/auth.types';
import { LOGIN_ERRORS } from '../constants/error-codes';
import { USER_STORAGE_KEY } from '../config/storage';

const isUserData = (value: unknown): value is UserData => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.user_id === 'number' && typeof v.role === 'string';
};

class AuthService {
  async login(email: string, password: string): Promise<UserData> {
    if (email.length > 50) {
      throw new Error(LOGIN_ERRORS.EMAIL_TOO_LONG);
    }

    if (password.length > 30) {
      throw new Error(LOGIN_ERRORS.PASSWORD_TOO_LONG);
    }

    const loginData: LoginRequest = { email, password };

    const response: ApiResponse<UserData> = await apiService.post(
      API_CONFIG.ENDPOINTS.LOGIN,
      loginData
    );

    if (!errorHandler.isSuccess(response.code)) {
      errorHandler.handleApiError(response, 'LOGIN');
    }

    return response.data;
  }

  saveUser(userData: UserData): void {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  }

  getUser(): UserData | null {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed: unknown = JSON.parse(raw);
      if (isUserData(parsed)) return parsed;
    } catch {
      // JSON corrupto: se descarta abajo
    }

    // Dato corrupto o con otro formato: se limpia para que la app pueda arrancar
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }

  logout(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return this.getUser() !== null;
  }
}

export default new AuthService();