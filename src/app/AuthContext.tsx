import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, getToken, setToken, removeToken, getUser, setUser, removeUser, UserType } from './api';

interface AuthContextType {
  user: UserType | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    college?: string;
    branch?: string;
    year?: string;
    rollNo?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateLocalUser: (updates: Partial<UserType>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserType | null>(getUser());
  const [isLoading, setIsLoading] = useState(!!getToken() && !getUser());

  // On mount: if we have a token but stale user data, re-fetch
  useEffect(() => {
    const token = getToken();
    if (token) {
      api.auth.me()
        .then((res) => {
          const freshUser = res.user;
          setUserState(freshUser);
          setUser(freshUser);
        })
        .catch(() => {
          // Token expired or invalid — clear everything
          removeToken();
          removeUser();
          setUserState(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    setToken(res.token);
    setUser(res.user);
    setUserState(res.user);
  };

  const adminLogin = async (email: string, password: string) => {
    const res = await api.auth.adminLogin(email, password);
    setToken(res.token);
    setUser(res.user);
    setUserState(res.user);
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    college?: string;
    branch?: string;
    year?: string;
    rollNo?: string;
  }) => {
    const res = await api.auth.register(data);
    setToken(res.token);
    setUser(res.user);
    setUserState(res.user);
  };

  const logout = () => {
    api.auth.logout().catch(() => {});
    removeToken();
    removeUser();
    setUserState(null);
  };

  const refreshUser = async () => {
    const res = await api.auth.me();
    setUserState(res.user);
    setUser(res.user);
  };

  const updateLocalUser = (updates: Partial<UserType>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUserState(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        adminLogin,
        register,
        logout,
        refreshUser,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
