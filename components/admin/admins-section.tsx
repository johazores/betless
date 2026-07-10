'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { FormActions, FormFieldGrid, SectionHeader } from '@/components/admin/section-header';
import { fetchTabData } from '@/components/admin/admin-utils';
import { AdminRole } from '@/lib/domain';
import { enumToSelectOptions, getDisplayLabel } from '@/lib/display-labels';
import { adminRoleDescriptions } from '@/lib/admin-permissions';
import { adminDelete, adminPatchJson, adminPostJson } from '@/lib/admin-api-client';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';

type AdminUser = {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

type AdminsSectionProps = {
  currentAdminId: string;
  onSuccess: (title: string, message?: string) => void;
  onError: (title: string, message?: string) => void;
};

const emptyCreate: {
  email: string;
  displayName: string;
  password: string;
  role: string;
} = {
  email: '',
  displayName: '',
  password: '',
  role: AdminRole.READ_ONLY,
};

export function AdminsSection({ currentAdminId, onSuccess, onError }: AdminsSectionProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [createBaseline, setCreateBaseline] = useState(emptyCreate);

  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBaseline, setEditBaseline] = useState({ role: '', displayName: '' });

  const [resetAdmin, setResetAdmin] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [deactivateAdmin, setDeactivateAdmin] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setAdmins(await fetchTabData<AdminUser[]>('/api/admin/admin-users'));
    } catch (loadError) {
      onError('Administrators could not be loaded', loadError instanceof Error ? loadError.message : undefined);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setCreateForm(emptyCreate);
    setCreateBaseline(emptyCreate);
    setCreateOpen(true);
  }

  function closeCreate() {
    setCreateOpen(false);
    setCreateForm(emptyCreate);
    setCreateBaseline(emptyCreate);
  }

  const createDirty =
    createForm.email !== createBaseline.email
    || createForm.displayName !== createBaseline.displayName
    || createForm.password !== createBaseline.password
    || createForm.role !== createBaseline.role;

  const editDirty = editAdmin
    ? editRole !== editBaseline.role || editDisplayName !== editBaseline.displayName
    : false;

  async function createAdmin(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await adminPostJson('/api/admin/admin-users', createForm);
      await load();
      onSuccess('Administrator created');
      closeCreate();
    } catch (submitError) {
      onError('Create failed', submitError instanceof Error ? submitError.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function saveEdit() {
    if (!editAdmin) return;
    setIsSubmitting(true);
    try {
      await adminPatchJson(`/api/admin/admin-users/${editAdmin.id}`, { role: editRole, displayName: editDisplayName });
      await load();
      onSuccess('Administrator updated');
      setEditAdmin(null);
    } catch (submitError) {
      onError('Update failed', submitError instanceof Error ? submitError.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmReset() {
    if (!resetAdmin || newPassword.length < 8) return;
    setIsSubmitting(true);
    try {
      await adminPostJson(`/api/admin/admin-users/${resetAdmin.id}/reset-password`, { password: newPassword });
      onSuccess('Password reset', 'All sessions for this administrator have been revoked.');
      setResetAdmin(null);
      setNewPassword('');
    } catch (submitError) {
      onError('Reset failed', submitError instanceof Error ? submitError.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmDeactivate() {
    if (!deactivateAdmin) return;
    setIsSubmitting(true);
    try {
      if (deactivateAdmin.isActive) {
        await adminDelete(`/api/admin/admin-users/${deactivateAdmin.id}`);
      } else {
        await adminPatchJson(`/api/admin/admin-users/${deactivateAdmin.id}`, { isActive: true });
      }
      await load();
      onSuccess(deactivateAdmin.isActive ? 'Administrator deactivated' : 'Administrator activated');
      setDeactivateAdmin(null);
    } catch (submitError) {
      onError('Action failed', submitError instanceof Error ? submitError.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  const roleOptions = enumToSelectOptions(Object.values(AdminRole), 'adminRole');

  if (isLoading) return <LoadingState label="Loading administrators..." variant="table" />;

  return (
    <div className="space-y-5">
      <SectionHeader
        badge="Team"
        title="Admin users"
        description="Create administrators and manage roles and access."
        actions={<Button onClick={openCreate}>Add administrator</Button>}
      />

      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <DataTable
          className="rounded-none border-0 shadow-none"
          headers={['Email', 'Name', 'Role', 'Status', 'Last login', '']}
          rows={admins.map((admin) => [
            admin.email,
            admin.displayName ?? '—',
            getDisplayLabel(admin.role, 'adminRole'),
            admin.isActive ? (
              <span key={`${admin.id}-active`} className="inline-flex rounded-md border border-success/20 bg-success-surface px-2 py-0.5 text-xs font-medium text-success">Active</span>
            ) : (
              <span key={`${admin.id}-inactive`} className="inline-flex rounded-md border border-line bg-surface-sunken px-2 py-0.5 text-xs font-medium text-ink-muted">Inactive</span>
            ),
            admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never',
            admin.id === currentAdminId ? (
              <span key={admin.id} className="text-xs text-ink-muted">Current user</span>
            ) : (
              <div key={admin.id} className="flex flex-wrap justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditAdmin(admin);
                    setEditRole(admin.role);
                    setEditDisplayName(admin.displayName ?? '');
                    setEditBaseline({ role: admin.role, displayName: admin.displayName ?? '' });
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setResetAdmin(admin)}>Reset password</Button>
                <Button size="sm" variant="ghost" onClick={() => setDeactivateAdmin(admin)}>
                  {admin.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            ),
          ])}
          emptyMessage="No administrators found"
        />
      </div>

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title="Add administrator"
        description="Create a new administrator account with an assigned role."
        size="lg"
        isDirty={createDirty}
        footer={(
          <FormActions className="pt-0">
            <Button type="button" variant="ghost" onClick={closeCreate}>Cancel</Button>
            <Button type="submit" form="create-admin-form" isLoading={isSubmitting}>Create administrator</Button>
          </FormActions>
        )}
      >
        <form id="create-admin-form" onSubmit={createAdmin} className="space-y-4">
          <FormFieldGrid columns={2}>
            <Input label="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} required />
            <Input label="Display name" value={createForm.displayName} onChange={(e) => setCreateForm((f) => ({ ...f, displayName: e.target.value }))} />
            <Input label="Password" type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} hint="Minimum 8 characters" required />
            <Select label="Role" value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))} options={roleOptions} />
          </FormFieldGrid>
          <p className="text-xs leading-5 text-ink-muted">{adminRoleDescriptions[createForm.role]}</p>
        </form>
      </Modal>

      <Modal
        open={editAdmin !== null}
        onClose={() => setEditAdmin(null)}
        title={editAdmin ? `Edit ${editAdmin.email}` : 'Edit administrator'}
        size="md"
        isDirty={editDirty}
        footer={(
          <FormActions className="pt-0">
            <Button variant="ghost" onClick={() => setEditAdmin(null)}>Cancel</Button>
            <Button onClick={() => void saveEdit()} isLoading={isSubmitting}>Save changes</Button>
          </FormActions>
        )}
      >
        <div className="space-y-4">
          <FormFieldGrid columns={2}>
            <Select label="Role" value={editRole} onChange={(e) => setEditRole(e.target.value)} options={roleOptions} />
            <Input label="Display name" value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} />
          </FormFieldGrid>
          <p className="text-xs leading-5 text-ink-muted">{adminRoleDescriptions[editRole]}</p>
        </div>
      </Modal>

      <Modal
        open={resetAdmin !== null}
        onClose={() => { setResetAdmin(null); setNewPassword(''); }}
        title="Reset password"
        description={resetAdmin ? `Set a new password for ${resetAdmin.email}. All active sessions will be revoked.` : undefined}
        size="md"
        isDirty={newPassword.length > 0}
        footer={(
          <FormActions className="pt-0">
            <Button variant="ghost" onClick={() => { setResetAdmin(null); setNewPassword(''); }}>Cancel</Button>
            <Button onClick={() => void confirmReset()} isLoading={isSubmitting} disabled={newPassword.length < 8}>Reset password</Button>
          </FormActions>
        )}
      >
        <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} hint="Minimum 8 characters" required />
      </Modal>

      <ConfirmDialog
        open={deactivateAdmin !== null}
        title={deactivateAdmin?.isActive ? 'Deactivate administrator' : 'Activate administrator'}
        description={deactivateAdmin ? `${deactivateAdmin.isActive ? 'Revoke access for' : 'Restore access for'} ${deactivateAdmin.email}?` : undefined}
        confirmLabel={deactivateAdmin?.isActive ? 'Deactivate' : 'Activate'}
        tone={deactivateAdmin?.isActive ? 'danger' : 'default'}
        isLoading={isSubmitting}
        onConfirm={() => void confirmDeactivate()}
        onCancel={() => setDeactivateAdmin(null)}
      />
    </div>
  );
}
