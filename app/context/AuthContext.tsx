'use client';
import React, { createContext, useContext } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => ({ success: false, message: 'تسجيل الدخول غير متاح' }),
  signup: async () => ({ success: false, message: 'إنشاء الحساب غير متاح' }),
  resetPassword: async () => ({ success: false, message: 'غير متاح' }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        login: async () => ({ success: false, message: 'تسجيل الدخول غير متاح' }),
        signup: async () => ({ success: false, message: 'إنشاء الحساب غير متاح' }),
        resetPassword: async () => ({ success: false, message: 'غير متاح' }),
        logout: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
