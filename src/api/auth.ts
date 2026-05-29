import { api } from './client';

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.token && response.user) {
      localStorage.setItem('ttin_auth_token', response.token);
      localStorage.setItem('ttin_admin_user', JSON.stringify(response.user));
    }
    return response;
  },
  
  register: async (data: LoginData & { name: string }) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.token) {
      localStorage.setItem('ttin_auth_token', response.token);
      localStorage.setItem('ttin_admin_user', JSON.stringify(response.user));
    }
    return response;
  },
  
  getProfile: () => api.get<User>('/auth/profile'),
  
  updateProfile: (data: Partial<User>) => api.put<User>('/auth/profile', data),
  
  logout: () => {
    localStorage.removeItem('ttin_auth_token');
    localStorage.removeItem('ttin_admin_user');
  },
  
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('ttin_admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('ttin_auth_token');
  },
};

export default authApi;