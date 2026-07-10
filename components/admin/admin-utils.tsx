'use client';

import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { adminApiRequest } from '@/lib/admin-api-client';
import type { AdminTab } from '@/components/layout/admin-layout';

type Feedback = { tone: 'success' | 'error'; title: string; message?: string };

export function useAdminFeedback() {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const showSuccess = useCallback((title: string, message?: string) => {
    setFeedback({ tone: 'success', title, message });
  }, []);

  const showError = useCallback((title: string, message?: string) => {
    setFeedback({ tone: 'error', title, message });
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 5000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const alerts = feedback ? (
    <Alert tone={feedback.tone} title={feedback.title}>
      {feedback.message ?? ''}
    </Alert>
  ) : null;

  return { showSuccess, showError, alerts, clearFeedback: () => setFeedback(null) };
}

export function useAsyncAction(showSuccess: (title: string, message?: string) => void, showError: (title: string, message?: string) => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const run = useCallback(
    async <T,>(action: () => Promise<T>, successTitle: string, successMessage?: string) => {
      setIsSubmitting(true);
      try {
        const result = await action();
        showSuccess(successTitle, successMessage);
        return result;
      } catch (actionError) {
        showError('Action failed', actionError instanceof Error ? actionError.message : 'Something went wrong.');
        throw actionError;
      } finally {
        setIsSubmitting(false);
      }
    },
    [showSuccess, showError],
  );

  return { isSubmitting, run };
}

export function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'ALL') search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function fetchTabData<T>(url: string) {
  return adminApiRequest<T>(url);
}

export type TabRefreshMap = Partial<Record<AdminTab, () => void>>;
