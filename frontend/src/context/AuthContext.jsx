import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('playarena_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
        } catch (err) {
          console.warn('Session expired or invalid, logging out:', err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('playarena_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem('playarena_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('playarena_token');
    setToken(null);
    setUser(null);
  };

  const quickLoginAs = async (role) => {
    if (role === 'admin') {
      return await login('admin@playarena.pk', 'admin123');
    } else {
      return await login('user@playarena.pk', 'user123');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, loading, login, register, logout, quickLoginAs }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
