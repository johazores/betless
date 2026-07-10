import type { ReactNode } from 'react';

type EmptyStateProps = {
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({
  title = 'Nothing to show yet',
  message = 'Create a Betless vault to start your plan.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-line bg-surface p-10 text-center shadow-card">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-700">
        {icon ?? (
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="8" width="18" height="12" rx="2" />
            <path d="M3 10h18M8 8V6a4 4 0 0 1 8 0v2" />
          </svg>
        )}
      </div>
      <p className="mt-4 text-lg font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-ink-muted">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
