'use client';

import { ThemeProvider } from 'next-themes';
import { HeaderActionProvider } from '@/context/HeaderActionContext';

import { useEffect } from 'react';
import axios from 'axios';

function AxiosGlobalConfig() {
  useEffect(() => {

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Ensure retryCount is initialized
        if (originalRequest && !originalRequest._retryCount) {
          originalRequest._retryCount = 0;
        }

        // Check for 401 Unauthorized
        if (originalRequest && (error.response?.status === 401 || error.response?.data?.message === 'Unauthorized')) {
          if (originalRequest._retryCount < 2) {
            originalRequest._retryCount += 1;
            // Retry the request
            return axios(originalRequest);
          } else {
            // Redirect to login after 3 attempts
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              document.cookie = 'token=; Max-Age=0; path=/';
              const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
              window.location.replace(`/admin2/login?callbackUrl=${callbackUrl}`);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {

      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return null;
}

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <HeaderActionProvider>
        <AxiosGlobalConfig />
        {children}
      </HeaderActionProvider>
    </ThemeProvider>
  );
}
