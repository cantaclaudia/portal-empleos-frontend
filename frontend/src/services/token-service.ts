import { API_CONFIG, TOKEN_STORAGE_KEY, TOKEN_EXPIRATION_KEY } from './api-config';

interface TokenResponse {
  token: string;
  token_expiration: string;
  code: number;
  description: string;
}

export class TokenService {
  static async getToken(): Promise<string> {
    const storedToken = this.getStoredToken();

    if (storedToken && !this.isTokenExpired()) {
      return storedToken;
    }

    const newToken = await this.fetchNewToken();
    return newToken;
  }

  private static async fetchNewToken(): Promise<string> {
    const credentials = btoa(`${API_CONFIG.basicAuth.username}:${API_CONFIG.basicAuth.password}`);

    const response = await fetch(`${API_CONFIG.baseURL}/getToken`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get token');
    }

    const data: TokenResponse = await response.json();

    this.storeToken(data.token, data.token_expiration);

    return data.token;
  }

  private static getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  private static storeToken(token: string, expiration: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_EXPIRATION_KEY, expiration);
  }

  private static isTokenExpired(): boolean {
    const expiration = localStorage.getItem(TOKEN_EXPIRATION_KEY);

    if (!expiration) {
      return true;
    }

    const expirationDate = new Date(expiration);
    const now = new Date();

    return now >= expirationDate;
  }

  static clearToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRATION_KEY);
  }
}
