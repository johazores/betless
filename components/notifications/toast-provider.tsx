'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { cn } from '@/lib/class-names';
import { toneStyles, type SemanticTone } from '@/lib/semantic-tokens';

type Toast = {
  id: string;
  title: string;
  body: string;
  tone: SemanticTone;
  actionUrl?: string;
};

type ToastContextValue = {
  push: (toast: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current.slice(-2), { ...toast, id }]);
    setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 5000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-24 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:bottom-6"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const styles = toneStyles[toast.tone];
          return (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto overflow-hidden rounded-xl border bg-surface shadow-elevated',
                styles.surface,
              )}
            >
              <div className="flex gap-3 p-4">
                <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg', styles.icon)}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M12 16v-4m0-4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" strokeLinecap="round" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-semibold', styles.text)}>{toast.title}</p>
                  <p className="mt-0.5 text-sm leading-6 text-ink-muted">{toast.body}</p>
                  {toast.actionUrl ? (
                    <Link href={toast.actionUrl} className="mt-2 inline-block text-xs font-bold text-brand-700 hover:text-brand-800">
                      View details →
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
