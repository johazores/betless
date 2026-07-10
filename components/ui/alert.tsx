import type { ReactNode } from 'react';
import { cn } from '@/lib/class-names';

type AlertProps = {
  title: string;
  children: ReactNode;
  tone?: 'info' | 'success' | 'error';
};

const tones = {
  info: {
    container: 'border-info/20 bg-info-surface text-info',
    icon: 'M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
  },
  success: {
    container: 'border-success/20 bg-success-surface text-success',
    icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
  },
  error: {
    container: 'border-danger/20 bg-danger-surface text-danger',
    icon: 'M12 9v4m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
  },
};

export function Alert({ title, children, tone = 'info' }: AlertProps) {
  const { container, icon } = tones[tone];

  return (
    <div className={cn('flex gap-3 rounded-xl border p-4', container)}>
      <svg
        className="mt-0.5 h-5 w-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={icon} />
      </svg>
      <div>
        <p className="font-semibold">{title}</p>
        <div className="mt-1 text-sm leading-6 opacity-90">{children}</div>
      </div>
    </div>
  );
}
