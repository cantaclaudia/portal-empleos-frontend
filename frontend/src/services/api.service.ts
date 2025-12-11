import { API_CONFIG, getAuthHeader } from '../config/api.config';
import type { TokenResponse } from '../types/auth.types';

class ApiService {
  private token: string | null = null;
  private tokenExpiration: Date | null = null;

  async getToken(): Promise<string> {
    if (this.token && this.tokenExpiration && new Date() < this.tokenExpiration) {
      return this.token;
    }

    if (API_CONFIG.TOKEN) {
      this.token = API_CONFIG.TOKEN;
      return this.token;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_TOKEN}`, {
        method: 'GET',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener el token');
      }

      const data: TokenResponse = await response.json();

      if (data.code !== '0200') {
        throw new Error(data.description || 'Error al obtener el token');
      }

      this.token = data.token;
      this.tokenExpiration = new Date(data.token_expiration);

      return this.token;
    } catch (error) {
      console.error('Error getting token:', error);
      throw error;
    }
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const token = await this.getToken();

    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();
