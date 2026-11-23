import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as authApi from '../api/authApi';
import { TOKEN_KEY, USER_KEY } from '../api/axios';

const AuthContext = createContext(null);

function readUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw && localStorage.getItem(TOKEN_KEY) ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const persist = useCallback((data) => {
    const u = {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      profileImageUrl: data.profileImageUrl,
      companyName: data.companyName,
    };
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const login = useCallback(async (email, password) => persist(await authApi.login({ email, password })), [persist]);
  const register = useCallback(async (payload) => persist(await authApi.register(payload)), [persist]);
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, register, logout, updateUser }), [user, login, register, logout, updateUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
