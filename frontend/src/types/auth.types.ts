import { ErrorCode } from "../constants/error-codes";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  code: ErrorCode;
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
  code: ErrorCode;
  description: string;
  token: string;
  token_expiration: string;
}

export interface ApiError {
  code: ErrorCode;
  description: string;
}

export interface ApiResponse<T> {
  code: ErrorCode;
  description: string;
  data: T;
}

