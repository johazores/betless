'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { fetchTabData } from '@/components/admin/admin-utils';
import { FormActions, FormFieldGrid, SectionHeader } from '@/components/admin/section-header';
import { adminApiRequest, adminDelete } from '@/lib/admin-api-client';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';
import { Modal } from '@/components/ui/modal';
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
  const [editItem, setEditItem] = useState<ConfigItem | null>(null);
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetKey, setResetKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setConfig(await fetchTabData<ConfigItem[]>('/api/admin/config'));
    } catch (loadError) {
      onError('Config could not be loaded', loadError instanceof Error ? loadError.message : undefined);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    void load();
  }, [load]);

  function openEdit(item: ConfigItem) {
    setEditItem(item);
    setValue('');
  }

  function closeEdit() {
    setEditItem(null);
    setValue('');
  }

  async function submitUpdate(event: FormEvent) {
    event.preventDefault();
    if (!editItem) return;
    setIsSubmitting(true);
    try {
      const rows = await adminApiRequest<ConfigItem[]>('/api/admin/config', {
        method: 'POST',
        body: JSON.stringify({ key: editItem.key, value }),
      });
      setConfig(rows);
      onSuccess('Config updated');
      closeEdit();
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
      <SectionHeader
        badge="Runtime"
        title="Config"
        description="Manage whitelisted configuration keys. Boot-critical keys are read-only."
      />

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
              <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>Edit</Button>
              {item.source === 'managed' ? (
                <Button size="sm" variant="ghost" onClick={() => setResetKey(item.key)}>Reset</Button>
              ) : null}
            </div>
          ) : 'Read only',
        ])}
      />

      <Modal
        open={editItem !== null}
        onClose={closeEdit}
        title={editItem ? `Edit ${editItem.key}` : 'Edit config'}
        description={editItem?.description}
        size="md"
        isDirty={value.trim().length > 0}
        footer={(
          <FormActions className="pt-0">
            <Button type="button" variant="ghost" onClick={closeEdit}>Cancel</Button>
            <Button type="submit" form="edit-config-form" isLoading={isSubmitting}>Save changes</Button>
          </FormActions>
        )}
      >
        {editItem ? (
          <form id="edit-config-form" onSubmit={submitUpdate} className="space-y-4">
            <Input
              label="Current value"
              value={editItem.value ?? 'Unset'}
              readOnly
              hint={editItem.isSecret ? 'Current value is masked for secrets.' : undefined}
            />
            <Input
              label="New value"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              hint={editItem.isSecret ? 'Secret values are encrypted at rest.' : undefined}
              required
            />
          </form>
        ) : null}
      </Modal>

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
