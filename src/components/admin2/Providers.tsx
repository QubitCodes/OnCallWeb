'use client';

import { ThemeProvider } from 'next-themes';
import { HeaderActionProvider } from '@/context/HeaderActionContext';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';

function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getCookie('token');

    if (pathname === '/admin/login') {
      if (token) {
        router.replace('/admin/dashboard');
        return;
      }
      setChecking(false);
      return;
    }

    if (pathname.startsWith('/admin')) {
      if (!token) {
        const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.replace(`/admin/login?callbackUrl=${callbackUrl}`);
        return;
      }
    }

    setChecking(false);
  }, [pathname, router]);

  if (checking && pathname.startsWith('/admin') && pathname !== '/admin/login') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa] dark:bg-[#171738]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return <>{children}</>;
}

function AxiosGlobalConfig() {
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Check for 401 Unauthorized
        if (error.response?.status === 401 || error.response?.data?.message === 'Unauthorized') {
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            document.cookie = 'token=; Max-Age=0; path=/';
            const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.replace(`/admin/login?callbackUrl=${callbackUrl}`);
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
        <AdminAuthGuard>
          {children}
        </AdminAuthGuard>
      </HeaderActionProvider>
    </ThemeProvider>
  );
}
