import api from './client';

export interface UserOut {
  id: number;
  email: string;
  full_name: string;
  has_company: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const authApi = {
  register: (email: string, password: string, full_name: string) =>
    api.post<AuthResponse>('/auth/register', { email, password, full_name }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  me: () => api.get<UserOut>('/auth/me'),
};
