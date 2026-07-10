'use client';

import { useCallback, useEffect, useState } from 'react';
import { UserDetailPanel } from '@/components/admin/user-detail-panel';
import { FilterToolbar, FilterSubmit } from '@/components/admin/filter-toolbar';
import { StatusBadge } from '@/components/admin/status-badge';
import { SectionHeader } from '@/components/admin/section-header';
import { buildQuery, fetchTabData } from '@/components/admin/admin-utils';
import type { UserRow } from '@/components/admin/types';
import { formatNumber, formatPeso } from '@/components/admin/types';
import { AdminPermission } from '@/lib/admin-permissions';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';

type UsersSectionProps = {
  can: (permission: string) => boolean;
  onSuccess: (title: string, message?: string) => void;
  onError: (title: string, message?: string) => void;
};

export function UsersSection({ can, onSuccess, onError }: UsersSectionProps) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchTabData<{ users: UserRow[]; total: number; page: number; pageSize: number }>(
        `/api/admin/users${buildQuery({ q: query || undefined, status, page })}`,
      );
      setUsers(result.users);
      setTotal(result.total);
      setPage(result.page);
      setPageSize(result.pageSize);
    } catch (loadError) {
      onError('Users could not be loaded', loadError instanceof Error ? loadError.message : undefined);
    } finally {
      setIsLoading(false);
    }
  }, [query, status, page, onError]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-5">
      <SectionHeader
        badge="Customers"
        title="Users"
        description="Search, inspect, and update platform users."
      />

      <FilterToolbar
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          void load();
        }}
      >
        <Input
          label="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by email, name, or user ID"
        />
        <Select
          label="Status"
          value={status}
          onChange={(event) => { setStatus(event.target.value); setPage(1); }}
          options={[
            { label: 'All statuses', value: 'ALL' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Suspended', value: 'SUSPENDED' },
            { label: 'Closed', value: 'CLOSED' },
          ]}
        />
        <FilterSubmit>Search</FilterSubmit>
      </FilterToolbar>

      {isLoading ? <LoadingState label="Loading users..." variant="table" /> : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <DataTable
            className="rounded-none border-0 shadow-none"
            headers={['User', 'Status', 'Verification', 'Locked', 'Points', 'Created']}
            rows={users.map((user) => [
              <button
                key={user.id}
                type="button"
                className="text-left font-medium text-ink underline-offset-2 transition-colors hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                onClick={() => setSelectedUserId(user.id)}
              >
                {user.email ?? user.id}
                {user.displayName ? <span className="mt-0.5 block text-xs font-normal text-ink-muted">{user.displayName}</span> : null}
              </button>,
              <StatusBadge key={`${user.id}-status`} status={user.status} context="userStatus" />,
              <StatusBadge key={`${user.id}-verification`} status={user.verificationStatus} context="verificationStatus" />,
              formatPeso(user.lockedBalance),
              formatNumber(user.pointsBalance),
              new Date(user.createdAt).toLocaleDateString(),
            ])}
            emptyMessage="No users found"
          />
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </div>
      )}

      <UserDetailPanel
        open={selectedUserId !== null}
        userId={selectedUserId}
        canManage={can(AdminPermission.MANAGE_USERS)}
        onClose={() => setSelectedUserId(null)}
        onUpdated={() => { void load(); onSuccess('User updated'); }}
        onError={onError}
      />
    </div>
  );
}
