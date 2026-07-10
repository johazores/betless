'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { fetchTabData } from '@/components/admin/admin-utils';
import { adminApiRequest, adminDelete } from '@/lib/admin-api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';
import { Select } from '@/components/ui/select';

type ConfigItem = {
  key: string;
  description: string;
  value: string | null;
  source: string;
  isSecret: boolean;
  bootCritical: boolean;
  updatedAt: string | null;
};

type ConfigSectionProps = {
  onSuccess: (title: string, message?: string) => void;
  onError: (title: string, message?: string) => void;
};

export function ConfigSection({ onSuccess, onError }: ConfigSectionProps) {
  const [config, setConfig] = useState<ConfigItem[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetKey, setResetKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await fetchTabData<ConfigItem[]>('/api/admin/config');
      setConfig(rows);
      setSelectedKey((current) => {
        if (current && rows.some((item) => item.key === current && !item.bootCritical)) return current;
        const editable = rows.filter((item) => !item.bootCritical);
        return editable[0]?.key ?? '';
      });
    } catch (loadError) {
      onError('Config could not be loaded', loadError instanceof Error ? loadError.message : undefined);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    void load();
  }, [load]);

  const editable = config.filter((item) => !item.bootCritical);
  const selected = config.find((item) => item.key === selectedKey);

  async function submitUpdate(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const rows = await adminApiRequest<ConfigItem[]>('/api/admin/config', {
        method: 'POST',
        body: JSON.stringify({ key: selectedKey, value }),
      });
      setConfig(rows);
      setValue('');
      onSuccess('Config updated');
    } catch (submitError) {
      onError('Update failed', submitError instanceof Error ? submitError.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmReset() {
    if (!resetKey) return;
    setIsSubmitting(true);
    try {
      const rows = await adminDelete<ConfigItem[]>(`/api/admin/config?key=${encodeURIComponent(resetKey)}`);
      setConfig(rows);
      onSuccess('Config reset to environment default');
      setResetKey(null);
    } catch (submitError) {
      onError('Reset failed', submitError instanceof Error ? submitError.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <LoadingState label="Loading config..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-ink">Managed runtime config</h2>
        <p className="mt-1 text-sm text-ink-muted">Update whitelisted configuration keys. Boot-critical keys are read-only.</p>
      </div>

      <Card padding="lg">
        <form onSubmit={submitUpdate} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <Select
            label="Key"
            value={selectedKey}
            onChange={(event) => { setSelectedKey(event.target.value); setValue(''); }}
            options={editable.map((item) => ({ label: item.key, value: item.key }))}
          />
          <Input
            label="New value"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            hint={selected?.isSecret ? 'Secret values are encrypted at rest.' : selected?.description}
            required
          />
          <Button type="submit" isLoading={isSubmitting}>Update config</Button>
        </form>
      </Card>

      <DataTable
        headers={['Key', 'Value', 'Source', 'Secret', 'Updated', 'Actions']}
        rows={config.map((item) => [
          item.key,
          item.value ?? 'Unset',
          item.source,
          item.isSecret ? 'Masked' : 'Plain',
          item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'Never',
          !item.bootCritical ? (
            <div key={item.key} className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setSelectedKey(item.key); setValue(''); }}>Edit</Button>
              {item.source === 'managed' ? (
                <Button size="sm" variant="ghost" onClick={() => setResetKey(item.key)}>Reset</Button>
              ) : null}
            </div>
          ) : 'Read only',
        ])}
      />

      <ConfirmDialog
        open={resetKey !== null}
        title="Reset config key"
        description={`Reset "${resetKey}" to the environment default? The managed override will be removed.`}
        confirmLabel="Reset to default"
        tone="danger"
        isLoading={isSubmitting}
        onConfirm={() => void confirmReset()}
        onCancel={() => setResetKey(null)}
      />
    </div>
  );
}
