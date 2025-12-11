export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  code: string;
  description: string;
  data: UserData;
}

export interface UserData {
  first_name: string;
  last_name: string;
  role: 'employer' | 'candidate';
  user_id: number;
}

export interface TokenResponse {
  code: string;
  description: string;
  token: string;
  token_expiration: string;
}

export interface ApiError {
  code: string;
  description: string;
}
