'use client';

import { useCallback, useEffect, useState } from 'react';
import { buildQuery, fetchTabData } from '@/components/admin/admin-utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-ink">Audit logs</h2>
        <p className="mt-1 text-sm text-ink-muted">Immutable record of all administrator actions.</p>
      </div>

      <Card padding="lg">
        <form
          className="grid gap-3 md:grid-cols-2 lg:grid-cols-5 lg:items-end"
          onSubmit={(event) => { event.preventDefault(); setPage(1); void load(); }}
        >
          <Input label="Action" value={action} onChange={(e) => setAction(e.target.value)} placeholder="POINTS_ADJUSTED" />
          <Input label="Admin user id" value={adminUserId} onChange={(e) => setAdminUserId(e.target.value)} />
          <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button type="submit" variant="secondary">Filter</Button>
        </form>
      </Card>

      {isLoading ? <LoadingState label="Loading audit logs..." /> : (
        <>
          <DataTable
            headers={['Time', 'Admin', 'Action', 'Target', 'Reason', 'Details']}
            rows={logs.map((log) => [
              new Date(log.createdAt).toLocaleString(),
              log.adminEmail ?? 'System',
              log.action,
              `${log.targetType ?? ''} ${log.targetId ?? ''}`.trim() || '—',
              log.reason ?? '—',
              <Button key={log.id} size="sm" variant="ghost" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                {expandedId === log.id ? 'Hide' : 'Show'}
              </Button>,
            ])}
          />
          {expandedId ? (
            <Card padding="md">
              {(() => {
                const log = logs.find((entry) => entry.id === expandedId);
                if (!log) return null;
                return (
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">IP:</span> {log.ipAddress ?? '—'}</p>
                    <p><span className="font-semibold">User agent:</span> {log.userAgent ?? '—'}</p>
                    <pre className="overflow-x-auto rounded-xl bg-surface-muted p-3 text-xs">{JSON.stringify(log.metadata, null, 2)}</pre>
                  </div>
                );
              })()}
            </Card>
          ) : null}
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
