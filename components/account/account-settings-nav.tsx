'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/class-names';

export type AccountSection = 'profile' | 'security' | 'notifications' | 'privacy' | 'activity';

const sections: Array<{ id: AccountSection; label: string; description: string }> = [
  { id: 'profile', label: 'Profile', description: 'Personal info & linked accounts' },
  { id: 'security', label: 'Security', description: 'Password, 2FA & sessions' },
  { id: 'notifications', label: 'Notifications', description: 'Email preferences' },
  { id: 'privacy', label: 'Privacy', description: 'Data & visibility' },
  { id: 'activity', label: 'Activity', description: 'Recent account events' },
];

type AccountSettingsNavProps = {
  active: AccountSection;
  onChange: (section: AccountSection) => void;
  className?: string;
};

export function AccountSettingsNav({ active, onChange, className }: AccountSettingsNavProps) {
  return (
    <nav className={cn('space-y-1', className)} aria-label="Account settings">
      {sections.map((section) => {
        const selected = active === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onChange(section.id)}
            className={cn(
              'w-full rounded-xl px-3 py-2.5 text-left transition-colors duration-150',
              selected
                ? 'bg-surface border border-line shadow-sm'
                : 'border border-transparent hover:bg-surface-sunken/80',
            )}
            aria-current={selected ? 'page' : undefined}
          >
            <span className={cn('block text-sm font-semibold', selected ? 'text-ink' : 'text-ink-muted')}>
              {section.label}
            </span>
            <span className="mt-0.5 block text-xs leading-5 text-ink-muted">{section.description}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function SettingsSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-5 border-b border-line/80 pb-5">
        <h2 className="text-lg font-black text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-ink-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
