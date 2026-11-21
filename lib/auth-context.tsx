'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  gradeLevel?: string;
  preferredLanguage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: 'student' | 'teacher',
    adminPasskey?: string,
    gradeLevel?: string
  ) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveSession = (tok: string, usr: User) => {
    setToken(tok);
    setUser(usr);
    try {
      localStorage.setItem('eduvision_token', tok);
      localStorage.setItem('eduvision_user', JSON.stringify(usr));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  };

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('eduvision_token');
      localStorage.removeItem('eduvision_user');
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('eduvision_token');
        const savedUser = localStorage.getItem('eduvision_user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            // parse failed
          }

          // Verify with backend
          try {
            const res = await api.get('/auth/me', {
              headers: { Authorization: `Bearer ${savedToken}` }
            });
            if (res.data?.success && res.data.user) {
              setUser(res.data.user);
              localStorage.setItem('eduvision_user', JSON.stringify(res.data.user));
            } else {
              clearSession();
            }
          } catch {
            // Token is expired or backend rejected it
            clearSession();
          }
        } else {
          // No active session — do NOT auto-login, require authentication
          clearSession();
        }
      } catch (err) {
        console.warn('Auth init error:', err);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [clearSession]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password
    });
    const { token: receivedToken, user: receivedUser } = res.data;
    saveSession(receivedToken, receivedUser);
    return receivedUser;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'teacher' = 'student',
    adminPasskey?: string,
    gradeLevel?: string
  ): Promise<User> => {
    const res = await api.post('/auth/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      adminPasskey,
      gradeLevel: gradeLevel || (role === 'teacher' ? 'Faculty' : 'BCA Student')
    });
    const { token: receivedToken, user: receivedUser } = res.data;
    saveSession(receivedToken, receivedUser);
    return receivedUser;
  };

  const logout = () => {
    clearSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
