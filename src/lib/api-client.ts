const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export { API_BASE_URL };

export interface RequestOptions {
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

/* ------------------------------------------------------------------ */
/* CSRF — fetched lazily once per session and attached automatically   */
/* to every mutating request (the Worker requires it on auth/contact). */
/* ------------------------------------------------------------------ */

let cachedCsrfToken: string | null = null;
let csrfFetch: Promise<string | null> | null = null;

export const fetchCsrfToken = async (force = false): Promise<string | null> => {
  if (force) {
    cachedCsrfToken = null;
    csrfFetch = null;
  }
  if (cachedCsrfToken) return cachedCsrfToken;
  if (!csrfFetch) {
    csrfFetch = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/csrf-token`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { csrfToken?: string };
        cachedCsrfToken = data.csrfToken || null;
        return cachedCsrfToken;
      } catch {
        return null;
      }
    })();
  }
  return csrfFetch;
};

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

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

  const isFormData = body instanceof FormData;

  const config: RequestInit = {
    method,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    credentials: 'include',
  };

  // Attach CSRF token automatically on mutating calls unless one was supplied.
  if (MUTATING_METHODS.has(method)) {
    const token = csrfToken ?? (await fetchCsrfToken());
    if (token) {
      config.headers = { ...config.headers, 'X-CSRF-Token': token };
    }
  }

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  if (signal) {
    config.signal = signal;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  let lastError: Error | null = null;
  let csrfRefreshed = false;
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

        // CSRF token can go stale (1h cookie) — refresh once and retry.
        if (response.status === 403 && MUTATING_METHODS.has(method) && !csrfRefreshed && !csrfToken) {
          csrfRefreshed = true;
          const fresh = await fetchCsrfToken(true);
          if (fresh) {
            config.headers = { ...config.headers, 'X-CSRF-Token': fresh };
            attempt--; // don't consume a retry slot
            continue;
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
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
  upload: <T>(endpoint: string, formData: FormData, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'POST', body: formData }),
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
