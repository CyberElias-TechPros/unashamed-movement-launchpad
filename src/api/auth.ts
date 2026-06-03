import { api } from './client';

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

const getCsrf = async () => {
  const response = await api.get<{ csrfToken: string }>('/auth/csrf-token');
  return response.csrfToken;
};

const postWithCsrf = async <T>(endpoint: string, body: unknown) => {
  const csrfToken = await getCsrf();
  return api.post<T>(endpoint, body, { csrfToken });
};

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    return postWithCsrf<AuthResponse>('/auth/login', data);
  },
  
  register: async (data: LoginData & { name: string }): Promise<AuthResponse> => {
    return postWithCsrf<AuthResponse>('/auth/register', data);
  },
  
  getProfile: () => api.get<User>('/auth/profile'),
  
  updateProfile: (data: Partial<User>) => postWithCsrf<User>('/auth/profile', data),
  
  logout: () => postWithCsrf('/auth/logout', {}),

  sendVerification: (email: { email: string }) => postWithCsrf<{ verificationUrl?: string }>('/auth/send-verification', email),

  verifyEmail: (token: { token: string }) => postWithCsrf<{ message: string }>('/auth/verify-email', token),
  forgotPassword: (email: { email: string }) => postWithCsrf<{ resetUrl?: string }>('/auth/forgot-password', email),
  resetPassword: (payload: { token: string; password: string }) => postWithCsrf<{ message: string }>('/auth/reset-password', payload),
  
  refreshToken: () => api.post<{ accessToken: string; user: User }>('/auth/refresh'),
  
  getCsrfToken: () => api.get<{ csrfToken: string }>('/auth/csrf-token'),
  
  getCurrentUser: (): User | null => {
    return null;
  },
  
  isAuthenticated: (): boolean => {
    return true;
  },
};

export default authApi;
