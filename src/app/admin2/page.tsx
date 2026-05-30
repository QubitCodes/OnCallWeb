'use client';

import { redirect } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function AdminRootPage() {
  const { isAuthenticated, loadingAuthCheck } = useAuth();
  useEffect(() => {
    if (!loadingAuthCheck) {
      if (isAuthenticated) {
        redirect('/admin/dashboard');
      } else {
        redirect('/admin/login');
      }
    }
  }, [isAuthenticated, loadingAuthCheck]);

  if (loadingAuthCheck) {
    return null;
  }

  return null;
}