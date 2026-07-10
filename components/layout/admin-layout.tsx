import Link from 'next/link';
import type { ReactNode } from 'react';
import { adminContainerClass } from '@/components/admin/section-header';
import { Logo } from '@/components/layout/logo';
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

function formatRoleLabel(role: string) {
  return role
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
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
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md">
        <div className={adminContainerClass}>
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Link href="/admin" className="shrink-0 rounded-xl transition-opacity hover:opacity-90" aria-label="Betless admin home">
                <Logo showTagline={false} markClassName="h-9 w-9" />
              </Link>
              <span className="hidden h-6 w-px bg-line sm:block" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-black text-ink">Admin</p>
                <p className="text-xs font-medium text-ink-muted">Internal operations</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="max-w-[14rem] truncate rounded-full bg-surface-sunken px-3 py-1.5 text-xs font-medium text-ink-muted sm:max-w-none">
                {adminEmail}
              </span>
              <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink">
                {formatRoleLabel(adminRole)}
              </span>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className={cn(adminContainerClass, 'py-8 lg:py-10')}>
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150',
                  activeTab === item.id
                    ? 'bg-ink text-white shadow-sm'
                    : 'border border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
                )}
                onClick={() => onTabChange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
            <aside className="hidden lg:block">
              <nav className="sticky top-[4.5rem] space-y-1 rounded-2xl border border-line bg-surface p-2 shadow-card">
                <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Workspace</p>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      'block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-150',
                      activeTab === item.id
                        ? 'bg-brand-100 text-brand-900'
                        : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                    )}
                    onClick={() => onTabChange(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>

            <section className="min-w-0 space-y-6">
              {alerts}
              {children}
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-line bg-surface">
        <div className={cn(adminContainerClass, 'py-8')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Logo showTagline={false} markClassName="h-8 w-8" />
            <p className="text-sm leading-6 text-ink-muted sm:text-right">
              Betless admin console. All actions are logged and attributed to your administrator account.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
