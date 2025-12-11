import { API_CONFIG } from './api-config';
import { TokenService } from './token-service';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  code: number;
  description: string;
  user?: {
    id: number;
    name: string;
    last_name: string;
    email: string;
    user_type: string;
    company_id?: number;
    resume_url?: string;
    skill_list?: string[];
  };
}

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    const token = await TokenService.getToken();

    const response = await fetch(`${API_CONFIG.baseURL}/login`, {
      method: 'POST',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      } as LoginRequest),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data: LoginResponse = await response.json();

    if (data.code !== 200 || !data.user) {
      throw new Error(data.description || 'Login failed');
    }

    return data;
  }

  static logout(): void {
    TokenService.clearToken();
    localStorage.removeItem('current_user');
  }

  static saveUser(user: LoginResponse['user']): void {
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
    }
  }

  static getCurrentUser(): LoginResponse['user'] | null {
    const userStr = localStorage.getItem('current_user');
    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}
