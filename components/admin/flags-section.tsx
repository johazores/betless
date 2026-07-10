'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { fetchTabData } from '@/components/admin/admin-utils';
import { FormActions, FormFieldGrid, SectionHeader } from '@/components/admin/section-header';
import { getDisplayLabel, humanizeIdentifier } from '@/lib/display-labels';
import { adminApiRequest, adminDelete } from '@/lib/admin-api-client';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';
import { Modal } from '@/components/ui/modal';

type FeatureFlag = {
  key: string;
  enabled: boolean;
  description: string | null;
  updatedAt: string;
};

type FlagForm = {
  key: string;
  description: string;
  enabled: boolean;
};

type FlagsSectionProps = {
  onSuccess: (title: string, message?: string) => void;
  onError: (title: string, message?: string) => void;
};

const emptyFlag: FlagForm = { key: '', description: '', enabled: false };

export function FlagsSection({ onSuccess, onError }: FlagsSectionProps) {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState<FlagForm>(emptyFlag);
  const [baseline, setBaseline] = useState<FlagForm>(emptyFlag);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [toggleTarget, setToggleTarget] = useState<FeatureFlag | null>(null);

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

  const isDirty =
    form.key !== baseline.key
    || form.description !== baseline.description
    || form.enabled !== baseline.enabled;

  function openCreate() {
    setFormMode('create');
    setForm(emptyFlag);
    setBaseline(emptyFlag);
    setFormOpen(true);
  }

  function openEdit(flag: FeatureFlag) {
    const next = { key: flag.key, description: flag.description ?? '', enabled: flag.enabled };
    setFormMode('edit');
    setForm(next);
    setBaseline(next);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setForm(emptyFlag);
    setBaseline(emptyFlag);
  }

  async function submitFlag(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await adminApiRequest('/api/admin/feature-flags', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      await load();
      onSuccess(formMode === 'create' ? 'Feature flag created' : 'Feature flag updated');
      closeForm();
    } catch (submitError) {
      onError('Save failed', submitError instanceof Error ? submitError.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmToggle() {
    if (!toggleTarget) return;
    setIsSubmitting(true);
    try {
      await adminApiRequest('/api/admin/feature-flags', {
        method: 'POST',
        body: JSON.stringify({
          key: toggleTarget.key,
          enabled: !toggleTarget.enabled,
          description: toggleTarget.description,
        }),
      });
      await load();
      onSuccess(`Flag ${toggleTarget.key} ${toggleTarget.enabled ? 'disabled' : 'enabled'}`);
      setToggleTarget(null);
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
      onSuccess('Feature flag deleted');
      setDeleteKey(null);
    } catch (submitError) {
      onError('Delete failed', submitError instanceof Error ? submitError.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <LoadingState label="Loading feature flags..." variant="table" />;

  return (
    <div className="space-y-5">
      <SectionHeader
        badge="Runtime"
        title="Feature flags"
        description="Create, update, toggle, and delete runtime feature flags."
        actions={<Button onClick={openCreate}>Create flag</Button>}
      />

      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <DataTable
          className="rounded-none border-0 shadow-none"
          headers={['Flag', 'Status', 'Description', 'Updated', '']}
          rows={flags.map((flag) => [
            <div key={`${flag.key}-label`}>
              <p className="font-medium text-ink">{humanizeIdentifier(flag.key)}</p>
              <p className="mt-0.5 font-mono text-[11px] text-ink-muted">{flag.key}</p>
            </div>,
            flag.enabled ? (
              <span key={`${flag.key}-on`} className="inline-flex rounded-md border border-success/20 bg-success-surface px-2 py-0.5 text-xs font-medium text-success">Enabled</span>
            ) : (
              <span key={`${flag.key}-off`} className="inline-flex rounded-md border border-line bg-surface-sunken px-2 py-0.5 text-xs font-medium text-ink-muted">Disabled</span>
            ),
            flag.description ?? '—',
            new Date(flag.updatedAt).toLocaleString(),
            <div key={flag.key} className="flex flex-wrap justify-end gap-1">
              <Button size="sm" variant="ghost" onClick={() => openEdit(flag)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => setToggleTarget(flag)} disabled={isSubmitting}>
                {flag.enabled ? 'Disable' : 'Enable'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteKey(flag.key)}>Delete</Button>
            </div>,
          ])}
          emptyMessage="No feature flags configured"
        />
      </div>

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={formMode === 'create' ? 'Create feature flag' : `Edit ${humanizeIdentifier(form.key)}`}
        description={formMode === 'create' ? 'Add a new runtime feature flag.' : 'Update flag settings.'}
        size="md"
        isDirty={isDirty}
        footer={(
          <FormActions className="pt-0">
            <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
            <Button type="submit" form="flag-form" isLoading={isSubmitting}>
              {formMode === 'create' ? 'Create flag' : 'Save changes'}
            </Button>
          </FormActions>
        )}
      >
        <form id="flag-form" onSubmit={submitFlag} className="space-y-4">
          <FormFieldGrid columns={2}>
            <Input
              label="Flag key"
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              placeholder="monthly_rewards"
              hint="Internal identifier — shown as a readable label in the UI"
              readOnly={formMode === 'edit'}
              required
            />
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </FormFieldGrid>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
              className="h-4 w-4 rounded border-line-strong"
            />
            Enabled
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={toggleTarget !== null}
        title={toggleTarget?.enabled ? 'Disable feature flag' : 'Enable feature flag'}
        description={toggleTarget ? `${toggleTarget.enabled ? 'Disable' : 'Enable'} "${humanizeIdentifier(toggleTarget.key)}"?` : undefined}
        confirmLabel={toggleTarget?.enabled ? 'Disable' : 'Enable'}
        isLoading={isSubmitting}
        onConfirm={() => void confirmToggle()}
        onCancel={() => setToggleTarget(null)}
      />

      <ConfirmDialog
        open={deleteKey !== null}
        title="Delete feature flag"
        description={`Permanently delete "${humanizeIdentifier(deleteKey ?? '')}"? This cannot be undone.`}
        confirmLabel="Delete flag"
        tone="danger"
        isLoading={isSubmitting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteKey(null)}
      />
    </div>
  );
}
