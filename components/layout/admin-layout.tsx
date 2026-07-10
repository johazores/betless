import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from '@/components/layout/logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/class-names';

export type AdminTab = 'dashboard' | 'users' | 'points' | 'chain' | 'config' | 'flags' | 'audit' | 'admins';

type AdminLayoutProps = {
  adminEmail: string;
  adminRole: string;
  activeTab: AdminTab;
  navItems: Array<{ id: AdminTab; label: string }>;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  children: ReactNode;
  alerts?: ReactNode;
};

export function AdminLayout({
  adminEmail,
  adminRole,
  activeTab,
  navItems,
  onTabChange,
  onLogout,
  children,
  alerts,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="shrink-0 rounded-xl transition-opacity hover:opacity-90" aria-label="Betless admin">
              <Logo />
            </Link>
            <Badge>Internal operations</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink">
              {adminEmail}
            </span>
            <Badge>{adminRole.replace(/_/g, ' ')}</Badge>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-4 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  activeTab === item.id
                    ? 'bg-ink text-white'
                    : 'border border-line bg-surface text-ink-muted hover:text-ink',
                )}
                onClick={() => onTabChange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1 rounded-2xl border border-line bg-surface p-2 shadow-card">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    'block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors',
                    activeTab === item.id
                      ? 'bg-ink text-white'
                      : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="space-y-4">
            {alerts}
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
