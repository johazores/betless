'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { adminContainerClass } from '@/components/admin/section-header';
import { AdminLayout, type AdminTab } from '@/components/layout/admin-layout';
import { useAdminFeedback } from '@/components/admin/admin-utils';
import { useAdminSession } from '@/components/admin/use-admin-session';
import { TAB_LABELS, TAB_PERMISSIONS } from '@/components/admin/types';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';

const sectionLoading = (label: string) => function SectionLoader() {
  return <LoadingState label={label} variant="centered" />;
};

const DashboardSection = dynamic(
  () => import('@/components/admin/dashboard-section').then((m) => ({ default: m.DashboardSection })),
  { loading: sectionLoading('Loading dashboard...') },
);
const UsersSection = dynamic(
  () => import('@/components/admin/users-section').then((m) => ({ default: m.UsersSection })),
  { loading: sectionLoading('Loading users...') },
);
const PointsSection = dynamic(
  () => import('@/components/admin/points-section').then((m) => ({ default: m.PointsSection })),
  { loading: sectionLoading('Loading points...') },
);
const OnChainSection = dynamic(
  () => import('@/components/admin/on-chain-section').then((m) => ({ default: m.OnChainSection })),
  { loading: sectionLoading('Loading on-chain...') },
);
const ConfigSection = dynamic(
  () => import('@/components/admin/config-section').then((m) => ({ default: m.ConfigSection })),
  { loading: sectionLoading('Loading configuration...') },
);
const FlagsSection = dynamic(
  () => import('@/components/admin/flags-section').then((m) => ({ default: m.FlagsSection })),
  { loading: sectionLoading('Loading feature flags...') },
);
const AuditSection = dynamic(
  () => import('@/components/admin/audit-section').then((m) => ({ default: m.AuditSection })),
  { loading: sectionLoading('Loading audit logs...') },
);
const AdminsSection = dynamic(
  () => import('@/components/admin/admins-section').then((m) => ({ default: m.AdminsSection })),
  { loading: sectionLoading('Loading administrators...') },
);

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
      <main className="min-h-screen bg-surface-muted">
        <div className={adminContainerClass}>
          <div className="py-10">
            <LoadingState label="Loading admin panel..." />
          </div>
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
