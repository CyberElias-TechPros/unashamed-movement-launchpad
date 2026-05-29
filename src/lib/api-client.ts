import { authApi } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const getAuthToken = () => localStorage.getItem('ttin_auth_token');

const requestInterceptor = async (url: string, config: RequestInit) => {
  const token = getAuthToken();
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }
  return { url, config };
};

const responseInterceptor = async (response: Response) => {
  if (response.status === 401 && window.location.pathname.startsWith('/admin')) {
    localStorage.removeItem('ttin_auth_token');
    localStorage.removeItem('ttin_admin_user');
    window.location.href = '/admin/login';
  }
  return response;
};

const apiClient = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const { url, config: finalConfig } = await requestInterceptor(`${API_BASE_URL}${endpoint}`, config);

  const response = await fetch(url, finalConfig);

  await responseInterceptor(response);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, errorData.message || 'Request failed', errorData.code);
  }

  return response.json();
};

export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) => apiClient<T>(endpoint, { method: 'POST', body }),
  put: <T>(endpoint: string, body: unknown) => apiClient<T>(endpoint, { method: 'PUT', body }),
  patch: <T>(endpoint: string, body: unknown) => apiClient<T>(endpoint, { method: 'PATCH', body }),
  delete: <T>(endpoint: string) => apiClient<T>(endpoint, { method: 'DELETE' }),
};

export default api;