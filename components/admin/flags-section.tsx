'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { fetchTabData } from '@/components/admin/admin-utils';
import { FormActions, FormFieldGrid, SectionHeader } from '@/components/admin/section-header';
import { adminApiRequest, adminDelete } from '@/lib/admin-api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';

type FeatureFlag = {
  key: string;
  enabled: boolean;
  description: string | null;
  updatedAt: string;
};

type FlagsSectionProps = {
  onSuccess: (title: string, message?: string) => void;
  onError: (title: string, message?: string) => void;
};

export function FlagsSection({ onSuccess, onError }: FlagsSectionProps) {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setFlags(await fetchTabData<FeatureFlag[]>('/api/admin/feature-flags'));
    } catch (loadError) {
      onError('Feature flags could not be loaded', loadError instanceof Error ? loadError.message : undefined);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    void load();
  }, [load]);

  function editFlag(flag: FeatureFlag) {
    setKey(flag.key);
    setDescription(flag.description ?? '');
    setEnabled(flag.enabled);
  }

  async function submitFlag(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await adminApiRequest('/api/admin/feature-flags', {
        method: 'POST',
        body: JSON.stringify({ key, enabled, description }),
      });
      await load();
      setKey('');
      setDescription('');
      setEnabled(false);
      onSuccess('Feature flag saved');
    } catch (submitError) {
      onError('Save failed', submitError instanceof Error ? submitError.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleFlag(flag: FeatureFlag) {
    setIsSubmitting(true);
    try {
      await adminApiRequest('/api/admin/feature-flags', {
        method: 'POST',
        body: JSON.stringify({ key: flag.key, enabled: !flag.enabled, description: flag.description }),
      });
      await load();
      onSuccess(`Flag ${flag.key} ${flag.enabled ? 'disabled' : 'enabled'}`);
    } catch (submitError) {
      onError('Toggle failed', submitError instanceof Error ? submitError.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteKey) return;
    setIsSubmitting(true);
    try {
      await adminDelete(`/api/admin/feature-flags/${encodeURIComponent(deleteKey)}`);
      await load();
      if (key === deleteKey) { setKey(''); setDescription(''); setEnabled(false); }
      onSuccess('Feature flag deleted');
      setDeleteKey(null);
    } catch (submitError) {
      onError('Delete failed', submitError instanceof Error ? submitError.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <LoadingState label="Loading feature flags..." />;

  return (
    <div className="space-y-6">
      <SectionHeader
        badge="Runtime"
        title="Feature flags"
        description="Create, update, toggle, and delete runtime feature flags."
      />

      <Card padding="lg">
        <form onSubmit={submitFlag} className="space-y-4">
          <FormFieldGrid columns={4}>
            <Input label="Key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="flag_key" required />
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <label className="flex min-h-[3.25rem] items-end gap-2 pb-3 text-sm font-semibold text-ink">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4 rounded border-line-strong" />
              Enabled
            </label>
          </FormFieldGrid>
          <FormActions>
            <Button type="submit" isLoading={isSubmitting}>{key && flags.some((f) => f.key === key) ? 'Update flag' : 'Create flag'}</Button>
          </FormActions>
        </form>
      </Card>

      <DataTable
        headers={['Key', 'Enabled', 'Description', 'Updated', 'Actions']}
        rows={flags.map((flag) => [
          flag.key,
          flag.enabled ? 'On' : 'Off',
          flag.description ?? '—',
          new Date(flag.updatedAt).toLocaleString(),
          <div key={flag.key} className="flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => editFlag(flag)}>Edit</Button>
            <Button size="sm" variant="secondary" onClick={() => void toggleFlag(flag)} disabled={isSubmitting}>
              {flag.enabled ? 'Disable' : 'Enable'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setDeleteKey(flag.key)}>Delete</Button>
          </div>,
        ])}
      />

      <ConfirmDialog
        open={deleteKey !== null}
        title="Delete feature flag"
        description={`Permanently delete flag "${deleteKey}"? This cannot be undone.`}
        confirmLabel="Delete flag"
        tone="danger"
        isLoading={isSubmitting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteKey(null)}
      />
    </div>
  );
}
