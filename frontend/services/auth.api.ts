import api, { setAccessToken } from '@/lib/api-client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  ApiSuccessResponse,
} from '@/types';

/**
 * Auth API service.
 * All auth-related HTTP calls are centralized here.
 * Components never call axios directly.
 */
export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiSuccessResponse<AuthResponse>>(
      '/auth/register',
      data
    );
    const { accessToken } = response.data.data;
    setAccessToken(accessToken);
    return response.data.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiSuccessResponse<AuthResponse>>(
      '/auth/login',
      data
    );
    const { accessToken } = response.data.data;
    setAccessToken(accessToken);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    setAccessToken(null);
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<ApiSuccessResponse<AuthResponse>>(
      '/auth/refresh'
    );
    const { accessToken } = response.data.data;
    setAccessToken(accessToken);
    return response.data.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiSuccessResponse<{ user: User }>>(
      '/auth/me'
    );
    return response.data.data.user;
  },
};
