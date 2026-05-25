'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

/**
 * AuthProvider — initializes auth state on app load.
 * 
 * On mount, attempts to restore the session by calling /auth/refresh
 * (which uses the httpOnly cookie). If the cookie is valid, the user
 * is silently re-authenticated without needing to log in again.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}
