import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "@/api/auth";

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_EXPIRY_KEY = 'ttin_token_expiry';
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshToken = async (): Promise<boolean> => {
    const storedUser = localStorage.getItem('ttin_admin_user');
    const token = localStorage.getItem('ttin_auth_token');
    
    if (!token) return false;

    try {
      const profile = await authApi.getProfile();
      const mapped: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as 'user' | 'admin',
      };
      setUser(mapped);
      localStorage.setItem('ttin_admin_user', JSON.stringify(mapped));
      return true;
    } catch (error) {
      localStorage.removeItem('ttin_auth_token');
      localStorage.removeItem('ttin_admin_user');
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('ttin_auth_token');
      const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      
      if (token) {
        const now = Date.now();
        const shouldRefresh = !tokenExpiry || (now - parseInt(tokenExpiry)) > (1000 * 60 * 30);
        
        if (shouldRefresh) {
          const refreshed = await refreshToken();
          if (!refreshed) {
            setIsLoading(false);
            return;
          }
        } else {
          const storedUser = localStorage.getItem('ttin_admin_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    const interval = setInterval(() => {
      const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (tokenExpiry && Date.now() - parseInt(tokenExpiry) > (1000 * 60 * 25)) {
        refreshToken();
      }
    }, 1000 * 60 * 10);

    return () => clearInterval(interval);
  }, []);

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
        localStorage.setItem(TOKEN_EXPIRY_KEY, Date.now().toString());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ttin_auth_token');
    localStorage.removeItem('ttin_admin_user');
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin,
    login,
    logout,
    refreshToken
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