import { API_CONFIG } from './api-config';
import { TokenService } from './token-service';

interface RegisterCandidateRequest {
  name: string;
  last_name: string;
  email: string;
  password: string;
  resume_url: string;
  skill_list: string[];
}

interface RegisterEmployerRequest {
  name: string;
  last_name: string;
  email: string;
  password: string;
  company_id: number;
}

interface RegisterResponse {
  code: number;
  description: string;
  user?: {
    id: number;
    name: string;
    last_name: string;
    email: string;
    user_type: string;
  };
}

export class RegistrationService {
  static async registerCandidate(data: RegisterCandidateRequest): Promise<RegisterResponse> {
    const token = await TokenService.getToken();

    const response = await fetch(`${API_CONFIG.baseURL}/registerCandidateUser`, {
      method: 'POST',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const result: RegisterResponse = await response.json();

    if (result.code !== 200) {
      throw new Error(result.description || 'Registration failed');
    }

    return result;
  }

  static async registerEmployer(data: RegisterEmployerRequest): Promise<RegisterResponse> {
    const token = await TokenService.getToken();

    const response = await fetch(`${API_CONFIG.baseURL}/registerEmployerUser`, {
      method: 'POST',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const result: RegisterResponse = await response.json();

    if (result.code !== 200) {
      throw new Error(result.description || 'Registration failed');
    }

    return result;
  }
}
