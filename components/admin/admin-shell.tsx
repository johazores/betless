'use client';

import { useMemo, useState } from 'react';
import { AdminLayout, type AdminTab } from '@/components/layout/admin-layout';
import { useAdminFeedback } from '@/components/admin/admin-utils';
import { useAdminSession } from '@/components/admin/use-admin-session';
import { TAB_LABELS, TAB_PERMISSIONS } from '@/components/admin/types';
import { DashboardSection } from '@/components/admin/dashboard-section';
import { UsersSection } from '@/components/admin/users-section';
import { PointsSection } from '@/components/admin/points-section';
import { OnChainSection } from '@/components/admin/on-chain-section';
import { ConfigSection } from '@/components/admin/config-section';
import { FlagsSection } from '@/components/admin/flags-section';
import { AuditSection } from '@/components/admin/audit-section';
import { AdminsSection } from '@/components/admin/admins-section';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';

export function AdminShell() {
  const { admin, isLoading, logout, can } = useAdminSession();
  const { alerts, showSuccess, showError } = useAdminFeedback();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const navItems = useMemo(
    () =>
      (Object.keys(TAB_PERMISSIONS) as AdminTab[])
        .filter((tab) => can(TAB_PERMISSIONS[tab]))
        .map((tab) => ({ id: tab, label: TAB_LABELS[tab] })),
    [can],
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-surface-muted px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <LoadingState label="Loading admin panel..." />
        </div>
      </main>
    );
  }

  if (!admin) return null;

  const activeAllowed = navItems.some((item) => item.id === activeTab);
  const currentTab = activeAllowed ? activeTab : navItems[0]?.id;

  return (
    <AdminLayout
      adminEmail={admin.email}
      adminRole={admin.role}
      activeTab={currentTab ?? 'dashboard'}
      navItems={navItems}
      onTabChange={setActiveTab}
      onLogout={() => void logout()}
      alerts={alerts}
    >
      {!currentTab ? (
        <EmptyState title="No access" message="Your administrator role does not grant access to any admin sections." />
      ) : currentTab === 'dashboard' ? (
        <DashboardSection />
      ) : currentTab === 'users' ? (
        <UsersSection can={can} onSuccess={showSuccess} onError={showError} />
      ) : currentTab === 'points' ? (
        <PointsSection onSuccess={showSuccess} onError={showError} />
      ) : currentTab === 'chain' ? (
        <OnChainSection can={can} onSuccess={showSuccess} onError={showError} />
      ) : currentTab === 'config' ? (
        <ConfigSection onSuccess={showSuccess} onError={showError} />
      ) : currentTab === 'flags' ? (
        <FlagsSection onSuccess={showSuccess} onError={showError} />
      ) : currentTab === 'audit' ? (
        <AuditSection onError={showError} />
      ) : currentTab === 'admins' ? (
        <AdminsSection currentAdminId={admin.id} onSuccess={showSuccess} onError={showError} />
      ) : null}
    </AdminLayout>
  );
}
