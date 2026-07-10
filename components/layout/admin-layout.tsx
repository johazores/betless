import Link from 'next/link';
import type { ReactNode } from 'react';
import { adminContainerClass } from '@/components/admin/section-header';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { getDisplayLabel } from '@/lib/display-labels';
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

function formatRoleLabel(role: string) {
  return getDisplayLabel(role, 'adminRole');
}

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
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-surface/95 backdrop-blur-md">
        <div className={adminContainerClass}>
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Link href="/admin" className="shrink-0 rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40" aria-label="Betless admin home">
                <Logo showTagline={false} markClassName="h-9 w-9" />
              </Link>
              <span className="hidden h-5 w-px bg-line sm:block" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">Admin</p>
                <p className="text-xs text-ink-muted">Internal operations</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="max-w-[14rem] truncate rounded-md bg-surface-sunken px-2.5 py-1 text-xs text-ink-muted sm:max-w-none">
                {adminEmail}
              </span>
              <span className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink">
                {formatRoleLabel(adminRole)}
              </span>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                Log out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className={cn(adminContainerClass, 'py-6 lg:py-8')}>
          <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  'shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                  activeTab === item.id
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                    : 'text-ink-muted hover:bg-surface hover:text-ink',
                )}
                onClick={() => onTabChange(item.id)}
                aria-current={activeTab === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
            <aside className="hidden lg:sticky lg:top-[4.5rem] lg:z-20 lg:block lg:max-h-[calc(100vh-4.5rem)] lg:self-start lg:overflow-y-auto">
              <nav className="space-y-0.5 pr-1" aria-label="Admin sections">
                <p className="mb-2 px-3 text-xs font-medium text-ink-muted">Workspace</p>
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      'relative block w-full rounded-lg py-2 pl-3 pr-3 text-left text-sm transition-colors duration-150',
                      isActive
                        ? 'bg-surface font-semibold text-ink after:absolute after:inset-y-1 after:left-0 after:w-[3px] after:rounded-r-sm after:bg-brand-600'
                        : 'font-medium text-ink-muted hover:bg-surface/70 hover:text-ink',
                    )}
                    onClick={() => onTabChange(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </button>
                  );
                })}
              </nav>
            </aside>

            <section className="min-w-0 space-y-6">
              {alerts}
              {children}
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-line/80 bg-surface">
        <div className={cn(adminContainerClass, 'py-6')}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Logo showTagline={false} markClassName="h-7 w-7" />
            <p className="text-xs leading-5 text-ink-muted sm:text-right">
              All administrator actions are logged and attributed to your account.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
