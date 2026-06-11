const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  maxRetries?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
  csrfToken?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const apiClient = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const {
    method = 'GET',
    body,
    headers = {},
    maxRetries = 3,
    timeoutMs = 15000,
    signal,
    csrfToken,
  } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
  };

  if (csrfToken) {
    config.headers = {
      ...config.headers,
      'X-CSRF-Token': csrfToken,
    };
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  if (signal) {
    config.signal = signal;
  }

  const { url } = { url: `${API_BASE_URL}${endpoint}` };

  let lastError: Error | null = null;
  const controller = signal ? undefined : new AbortController();
  const timeoutId = setTimeout(() => controller?.abort(), timeoutMs);

  try {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, { ...config, signal: controller?.signal });

        if (controller?.signal.aborted) {
          throw new Error('Request timed out');
        }

        if (response.status === 401 && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
          throw new Error('Unauthorized');
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
          if (response.status >= 500 || response.status === 429) {
            throw new ApiError(response.status, errorData.message || 'Server error', errorData.code);
          }
          throw new ApiError(response.status, errorData.message || 'Request failed', errorData.code);
        }

        return response.json();
      } catch (error) {
        lastError = error as Error;
        const isTimeout = error instanceof Error && error.message === 'Request timed out';
        const isRateLimit = lastError instanceof ApiError && lastError.status === 429;
        const isServerError = lastError instanceof ApiError && lastError.status >= 500;
        const isUnauthorized = error instanceof Error && error.message === 'Unauthorized';
        const isTransient = isTimeout || isRateLimit || isServerError;

        if (isUnauthorized || (!isTransient || attempt >= maxRetries - 1 || signal?.aborted)) {
          break;
        }

        const backoff = Math.min(1000 * Math.pow(2, attempt), 10000);
        await sleep(backoff);
      }
    }

    if (lastError instanceof ApiError) {
      throw lastError;
    } else if (lastError) {
      throw new ApiError(0, lastError.message, 'NETWORK_ERROR');
    } else {
      throw new ApiError(0, 'Request failed', 'UNKNOWN_ERROR');
    }
  } finally {
    clearTimeout(timeoutId);
  }
};

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

const buildQueryString = (params: PaginationParams): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'POST', body }),
  put: <T>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'PUT', body }),
  patch: <T>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'PATCH', body }),
  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
  
  // Paginated GET with query parameters
  getPaginated: <T>(endpoint: string, params: PaginationParams, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<PaginatedResponse<T>>(`${endpoint}${buildQueryString(params)}`, { ...options, method: 'GET' }),
};

export default api;
