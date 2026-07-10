'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildQuery, fetchTabData } from '@/components/admin/admin-utils';
import { FilterToolbar } from '@/components/admin/filter-toolbar';
import { getDisplayLabel } from '@/lib/display-labels';
import { SectionHeader } from '@/components/admin/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';

type AuditLog = {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  reason: string | null;
  metadata: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  adminEmail: string | null;
  adminUserId: string | null;
  createdAt: string;
};

type AuditSectionProps = {
  onError: (title: string, message?: string) => void;
};

export function AuditSection({ onError }: AuditSectionProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [action, setAction] = useState('');
  const [adminUserId, setAdminUserId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchTabData<{ logs: AuditLog[]; total: number; page: number; pageSize: number }>(
        `/api/admin/audit${buildQuery({ page, action: action || undefined, adminUserId: adminUserId || undefined, from: from || undefined, to: to || undefined })}`,
      );
      setLogs(result.logs);
      setTotal(result.total);
      setPage(result.page);
      setPageSize(result.pageSize);
    } catch (loadError) {
      onError('Audit logs could not be loaded', loadError instanceof Error ? loadError.message : undefined);
    } finally {
      setIsLoading(false);
    }
  }, [page, action, adminUserId, from, to, onError]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedLog = useMemo(
    () => logs.find((entry) => entry.id === selectedLogId) ?? null,
    [logs, selectedLogId],
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        badge="Compliance"
        title="Audit logs"
        description="Immutable record of all administrator actions."
      />

      <FilterToolbar
        layout="wide"
        onSubmit={(event) => { event.preventDefault(); setPage(1); void load(); }}
      >
        <Input label="Action" value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g. Points adjusted" />
        <Input label="Admin user id" value={adminUserId} onChange={(e) => setAdminUserId(e.target.value)} />
        <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button type="submit" variant="secondary">Filter</Button>
      </FilterToolbar>

      {isLoading ? <LoadingState label="Loading audit logs..." /> : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <DataTable
            className="rounded-none border-0 shadow-none"
            headers={['Time', 'Admin', 'Action', 'Target', 'Reason', '']}
            rows={logs.map((log) => [
              new Date(log.createdAt).toLocaleString(),
              log.adminEmail ?? 'System',
              getDisplayLabel(log.action, 'auditAction'),
              log.targetType || log.targetId
                ? [
                    log.targetType ? getDisplayLabel(log.targetType, 'targetType') : null,
                    log.targetId ? `${log.targetId.slice(0, 8)}…` : null,
                  ].filter(Boolean).join(' · ')
                : '—',
              log.reason ?? '—',
              <Button key={log.id} size="sm" variant="ghost" onClick={() => setSelectedLogId(log.id)}>
                View
              </Button>,
            ])}
            emptyMessage="No audit entries found"
          />

          <Modal
            open={selectedLog !== null}
            onClose={() => setSelectedLogId(null)}
            title={selectedLog ? getDisplayLabel(selectedLog.action, 'auditAction') : 'Audit entry'}
            description={selectedLog ? new Date(selectedLog.createdAt).toLocaleString() : undefined}
            size="lg"
          >
            {selectedLog ? (
              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  ['Admin', selectedLog.adminEmail ?? 'System'],
                  ['Target', selectedLog.targetType || selectedLog.targetId
                    ? [
                        selectedLog.targetType ? getDisplayLabel(selectedLog.targetType, 'targetType') : null,
                        selectedLog.targetId ?? null,
                      ].filter(Boolean).join(' · ')
                    : '—'],
                  ['Reason', selectedLog.reason ?? '—'],
                  ['IP address', selectedLog.ipAddress ?? '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-medium text-ink-muted">{label}</dt>
                    <dd className="mt-1 text-sm text-ink">{value}</dd>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-ink-muted">User agent</dt>
                  <dd className="mt-1 break-all text-sm text-ink">{selectedLog.userAgent ?? '—'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-ink-muted">Metadata</dt>
                  <dd className="mt-2">
                    <pre className="overflow-x-auto rounded-lg border border-line bg-surface-muted p-3 text-xs leading-5 text-ink">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </dd>
                </div>
              </dl>
            ) : null}
          </Modal>

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
