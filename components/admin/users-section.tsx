'use client';

import { useCallback, useEffect, useState } from 'react';
import { UserDetailPanel } from '@/components/admin/user-detail-panel';
import { SectionHeader } from '@/components/admin/section-header';
import { buildQuery, fetchTabData } from '@/components/admin/admin-utils';
import type { UserRow } from '@/components/admin/types';
import { formatNumber, formatPeso } from '@/components/admin/types';
import { AdminPermission } from '@/lib/admin-permissions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    <div className="space-y-6">
      <SectionHeader
        badge="Customers"
        title="Users"
        description="Search, inspect, and update platform users."
      />

      <Card padding="lg">
        <form
          className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end"
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
            placeholder="Email, name, or Clerk id"
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
          <Button type="submit" variant="secondary" className="w-full sm:w-auto">Search</Button>
        </form>
      </Card>

      {isLoading ? <LoadingState label="Loading users..." /> : (
        <>
          <DataTable
            headers={['User', 'Status', 'Locked', 'Points', 'Created']}
            rows={users.map((user) => [
              <button
                key={user.id}
                type="button"
                className="text-left font-semibold text-ink transition-colors hover:text-brand-600"
                onClick={() => setSelectedUserId(user.id)}
              >
                {user.email ?? user.id}
                {user.displayName ? <span className="mt-0.5 block text-xs font-medium text-ink-muted">{user.displayName}</span> : null}
              </button>,
              `${user.status} / ${user.verificationStatus}`,
              formatPeso(user.lockedBalance),
              formatNumber(user.pointsBalance),
              new Date(user.createdAt).toLocaleDateString(),
            ])}
          />
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </>
      )}

      {selectedUserId ? (
        <UserDetailPanel
          userId={selectedUserId}
          canManage={can(AdminPermission.MANAGE_USERS)}
          onClose={() => setSelectedUserId(null)}
          onUpdated={() => { void load(); onSuccess('User updated'); }}
          onError={onError}
        />
      ) : null}
    </div>
  );
}
