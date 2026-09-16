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
  avatar?: string;
  emailVerified?: boolean;
}

/** Some endpoints return `_id` (legacy shape) — normalize to `id`. */
const normalizeUser = <T extends { id?: string; _id?: string }>(user: T): T & { id: string } => ({
  ...user,
  id: user.id || user._id || '',
});

const getCsrf = async () => {
  const response = await api.get<{ csrfToken: string }>('/auth/csrf-token');
  await new Promise(resolve => setTimeout(resolve, 100));
  return response.csrfToken;
};

const postWithCsrf = async <T>(endpoint: string, body: unknown) => {
  const csrfToken = await getCsrf();
  return api.post<T>(endpoint, body, { csrfToken });
};

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const res = await postWithCsrf<AuthResponse>('/auth/login', data);
    return { ...res, user: normalizeUser(res.user) };
  },
  
  register: async (data: LoginData & { name: string }): Promise<AuthResponse> => {
    const res = await postWithCsrf<AuthResponse>('/auth/register', data);
    return { ...res, user: normalizeUser(res.user) };
  },
  
  getProfile: async () => normalizeUser(await api.get<User>('/auth/profile')),
  
  // Fixed: was POST, but the API only implements PUT /auth/profile.
  updateProfile: (data: Partial<User>) => api.put<{ user: User }>('/auth/profile', data).then(res => normalizeUser(res.user ?? (res as unknown as User))),
  
  logout: () => postWithCsrf('/auth/logout', {}),

  sendVerification: (email: { email: string }) => postWithCsrf<{ verificationUrl?: string }>('/auth/send-verification', email),

  verifyEmail: (token: { token: string }) => postWithCsrf<{ message: string }>('/auth/verify-email', token),
  forgotPassword: (email: { email: string }) => postWithCsrf<{ resetUrl?: string }>('/auth/forgot-password', email),
  resetPassword: (payload: { token: string; password: string }) => postWithCsrf<{ message: string }>('/auth/reset-password', payload),
  
  refreshToken: async () => {
    const res = await api.post<{ accessToken: string; user: User }>('/auth/refresh', {});
    return { ...res, user: normalizeUser(res.user) };
  },
  
  getCsrfToken: () => api.get<{ csrfToken: string }>('/auth/csrf-token'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    postWithCsrf<{ message: string }>('/auth/change-password', data),

  // --- Admin: user management ---
  adminListUsers: (params?: { page?: number; limit?: number; search?: string; role?: string; active?: string; verified?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.search) q.set('search', params.search);
    if (params?.role) q.set('role', params.role);
    if (params?.active) q.set('active', params.active);
    if (params?.verified) q.set('verified', params.verified);
    const query = q.toString();
    return api.get<{ success: boolean; data: User[]; pagination: { page: number; totalPages: number; totalCount: number } }>(
      `/auth/admin/users${query ? `?${query}` : ''}`
    );
  },

  adminUpdateUser: (id: string, data: { role?: 'user' | 'admin'; isActive?: boolean }) =>
    api.patch<{ user: User }>(`/auth/admin/users/${id}`, data),

  adminResendVerification: (id: string) =>
    postWithCsrf<{ message: string; verificationUrl?: string }>(`/auth/admin/users/${id}/resend-verification`, {}),
};

export default authApi;
