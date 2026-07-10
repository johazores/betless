'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ADMIN_REFRESH_INTERVAL_MS,
  fetchAdminSession,
  logoutAdmin,
  setAdminAccessToken,
} from '@/lib/admin-api-client';
import type { AdminProfile } from '@/components/admin/types';

function sameAdminSession(current: AdminProfile | null, next: AdminProfile) {
  if (!current) return false;
  if (current.id !== next.id || current.email !== next.email || current.role !== next.role) return false;
  if (current.permissions.length !== next.permissions.length) return false;
  return current.permissions.every((permission, index) => permission === next.permissions[index]);
}

export function useAdminSession() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSession = useCallback(async () => {
    setError('');
    try {
      const session = await fetchAdminSession();
      setAdminAccessToken(session.accessToken);
      setAdmin((current) => (sameAdminSession(current, session.admin) ? current : session.admin));
      return session.admin;
    } catch (loadError) {
      router.replace('/admin/login');
      throw loadError;
    }
  }, [router]);

  useEffect(() => {
    void loadSession()
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, [loadSession]);

  useEffect(() => {
    if (!admin) return;
    const interval = window.setInterval(() => {
      void fetchAdminSession()
        .then((session) => {
          setAdminAccessToken(session.accessToken);
          setAdmin((current) => (sameAdminSession(current, session.admin) ? current : session.admin));
        })
        .catch(() => router.replace('/admin/login'));
    }, ADMIN_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [admin, router]);

  const logout = useCallback(async () => {
    await logoutAdmin();
    router.replace('/admin/login');
  }, [router]);

  const can = useCallback(
    (permission: string) => admin?.permissions.includes(permission) ?? false,
    [admin],
  );

  return { admin, isLoading, error, setError, loadSession, logout, can };
}
