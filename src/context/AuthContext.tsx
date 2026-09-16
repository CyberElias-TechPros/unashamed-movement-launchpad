import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "@/api/auth";

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  avatar?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ emailVerified?: boolean } | undefined>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
  getCsrfToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const refreshToken = async (): Promise<boolean> => {
    if (!document.cookie.includes('userRole=')) {
      return false;
    }

    try {
      const response = await authApi.refreshToken();
      if (response.user) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role as 'user' | 'admin',
        });
        return true;
      }
      return false;
    } catch {
      setUser(null);
      return false;
    }
  };

  const fetchCsrfToken = async (): Promise<string | null> => {
    try {
      // Fixed: use the shared API client base so this works when the API is
      // proxied or served from another origin.
      const { fetchCsrfToken: refreshSharedToken } = await import('@/lib/api-client');
      const token = await refreshSharedToken(true);
      setCsrfToken(token);
      return token;
    } catch {
      return null;
    }
  };

  const getCsrfToken = () => csrfToken;

  const mapUser = (u: { id: string; email: string; name?: string; role: string; avatar?: string; emailVerified?: boolean }): User => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as 'user' | 'admin',
    avatar: u.avatar,
    emailVerified: u.emailVerified,
  });

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    
    const initAuth = async () => {
      try {
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          const profile = await authApi.getProfile();
          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role as 'user' | 'admin',
            });
          }
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [initialized]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      if (response.user) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role as 'user' | 'admin',
        });
        await fetchCsrfToken();
      }
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number };
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({ name, email, password });
      if (response.user) {
        setUser(mapUser(response.user as never));
        await fetchCsrfToken();
        return { emailVerified: (response.user as { emailVerified?: boolean }).emailVerified };
      }
      return undefined;
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number };
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /** Re-fetch the profile (e.g. after verifying email or editing the account). */
  const refreshUser = async () => {
    try {
      const profile = await authApi.getProfile();
      if (profile) setUser(mapUser(profile as never));
    } catch {
      /* keep current state on failure */
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      setCsrfToken(null);
    }
  };

  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin,
    login,
    register,
    logout,
    refreshToken,
    refreshUser,
    getCsrfToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};