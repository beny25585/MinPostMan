'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi, getToken } from '@/lib/auth';

interface User {
  username: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on mount
    const token = getToken();
    if (token) {
      const storedUsername = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
      const storedFullName = typeof window !== 'undefined' ? localStorage.getItem('full_name') : null;
      const storedFirstName = typeof window !== 'undefined' ? localStorage.getItem('first_name') : null;
      const storedLastName = typeof window !== 'undefined' ? localStorage.getItem('last_name') : null;
      setUser({ 
        username: storedUsername || 'user',
        first_name: storedFirstName || undefined,
        last_name: storedLastName || undefined,
        full_name: storedFullName || storedUsername || 'user'
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const data = await loginApi(username, password);
    setUser({
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: data.full_name
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('username', data.username);
      localStorage.setItem('full_name', data.full_name);
      localStorage.setItem('first_name', data.first_name || '');
      localStorage.setItem('last_name', data.last_name || '');
    }
  };

  const register = async (username: string, password: string, firstName?: string, lastName?: string) => {
    const data = await registerApi(username, password, firstName, lastName);
    setUser({
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: data.full_name
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('username', data.username);
      localStorage.setItem('full_name', data.full_name);
      localStorage.setItem('first_name', data.first_name || '');
      localStorage.setItem('last_name', data.last_name || '');
    }
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('username');
      localStorage.removeItem('full_name');
      localStorage.removeItem('first_name');
      localStorage.removeItem('last_name');
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
