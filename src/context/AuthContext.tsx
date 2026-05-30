// contexts/AuthContext.tsx
'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/api'; // Your axios instance
import { API_URL } from '@/config/api'; // Your API base URL

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  loadingAuthCheck: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null); // User data
  const [loadingAuthCheck, setLoadingAuthCheck] = useState<boolean>(true); // For initial auth check loading
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus().finally(() => setLoadingAuthCheck(false)); // Initial auth check on component mount
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const token = response.data?.misc?.token || response.data?.token;
      if (response.data && token) {
        // Store token in localStorage
        localStorage.setItem('admin_token', token);
        setIsAuthenticated(true);
        await checkAuthStatus(); // Fetch user data after login
        // If middleware sent us with a redirect param, prefer that
        try {
          const params = new URLSearchParams(window.location.search);
          const redirectTo = params.get('redirect');
          if (redirectTo && redirectTo.startsWith('/admin')) {
            router.push(redirectTo);
          } else {
            router.push('/admin/dashboard');
          }
        } catch {
          router.push('/admin/dashboard');
        }
      } else {
        throw new Error('No token received from server');
      }
    } catch (error: unknown) {
      console.error('Login failed:', error);
      setIsAuthenticated(false); // Ensure isAuthenticated is false on login failure
      setUser(null);
      // Clear any existing token
      localStorage.removeItem('admin_token');
      throw error; // Re-throw error to handle in login page if needed
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`); // Call logout API endpoint
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with logout even if API call fails
    } finally {
      // Always clear local state and token
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('admin_token');
      router.push('/admin/login'); // Redirect to login page after logout
    }
  };

  const checkAuthStatus = async () => {
    try {
      // Check if token exists in localStorage
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Validate token by making API call
      const response = await axios.get(`${API_URL}/auth/me`);
      if (response.status === 200 && response.data?.status) {
        setIsAuthenticated(true);
        setUser(response.data.data || response.data.user); // Set user data from response
      } else {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('admin_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('admin_token');
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    checkAuthStatus,
    loadingAuthCheck
  };

  if (loadingAuthCheck) {
    return null; // Or a loading spinner
  }


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};