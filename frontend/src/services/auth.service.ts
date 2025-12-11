import { apiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import type { LoginRequest, LoginResponse, UserData } from '../types/auth.types';

const USER_STORAGE_KEY = 'portal_empleos_user';

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    if (email.length > 50) {
      throw new Error('El correo electrónico no puede exceder 50 caracteres');
    }

    if (password.length > 30) {
      throw new Error('La contraseña no puede exceder 30 caracteres');
    }

    try {
      const loginData: LoginRequest = { email, password };
      const response = await apiService.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.LOGIN,
        loginData
      );

      if (response.code === '0200') {
        return response;
      } else if (response.code === '0404') {
        throw new Error('Usuario o contraseña incorrectos');
      } else if (response.code === '0400') {
        throw new Error('Solicitud incorrecta. Verifica los datos ingresados');
      } else if (response.code === '0500') {
        throw new Error('Error interno del servidor. Intenta nuevamente más tarde');
      } else {
        throw new Error(response.description || 'Error al iniciar sesión');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión. Verifica tu conexión a internet');
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
