'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { FormActions, FormFieldGrid, SectionHeader } from '@/components/admin/section-header';
import { fetchTabData } from '@/components/admin/admin-utils';
import { AdminRole } from '@/lib/domain';
import { adminRoleDescriptions, adminRoleLabels } from '@/lib/admin-permissions';
import { adminDelete, adminPatchJson, adminPostJson } from '@/lib/admin-api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';
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

export function AdminsSection({ currentAdminId, onSuccess, onError }: AdminsSectionProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>(AdminRole.READ_ONLY);

  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');

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

  async function createAdmin(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await adminPostJson('/api/admin/admin-users', { email, password, role, displayName });
      setEmail('');
      setDisplayName('');
      setPassword('');
      setRole(AdminRole.READ_ONLY);
      await load();
      onSuccess('Administrator created');
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

  const roleOptions = Object.values(AdminRole).map((value) => ({
    label: adminRoleLabels[value] ?? value,
    value,
  }));

  if (isLoading) return <LoadingState label="Loading administrators..." />;

  return (
    <div className="space-y-6">
      <SectionHeader
        badge="Team"
        title="Admin users"
        description="Create administrators and manage roles and access."
      />

      <Card padding="lg">
        <form onSubmit={createAdmin} className="space-y-4">
          <FormFieldGrid columns={4}>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} hint="Minimum 8 characters" required />
            <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)} options={roleOptions} />
          </FormFieldGrid>
          <p className="text-xs leading-5 text-ink-muted">{adminRoleDescriptions[role]}</p>
          <FormActions>
            <Button type="submit" isLoading={isSubmitting}>Add administrator</Button>
          </FormActions>
        </form>
      </Card>

      {editAdmin ? (
        <Card padding="lg" className="space-y-4">
          <h3 className="text-lg font-black text-ink">Edit {editAdmin.email}</h3>
          <FormFieldGrid columns={2}>
            <Select label="Role" value={editRole} onChange={(e) => setEditRole(e.target.value)} options={roleOptions} />
            <Input label="Display name" value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} />
          </FormFieldGrid>
          <p className="text-xs leading-5 text-ink-muted">{adminRoleDescriptions[editRole]}</p>
          <FormActions>
            <Button variant="ghost" onClick={() => setEditAdmin(null)}>Cancel</Button>
            <Button onClick={() => void saveEdit()} isLoading={isSubmitting}>Save changes</Button>
          </FormActions>
        </Card>
      ) : null}

      {resetAdmin ? (
        <Card padding="lg" className="space-y-4">
          <h3 className="text-lg font-black text-ink">Reset password for {resetAdmin.email}</h3>
          <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} hint="Minimum 8 characters" required />
          <FormActions>
            <Button variant="ghost" onClick={() => { setResetAdmin(null); setNewPassword(''); }}>Cancel</Button>
            <Button onClick={() => void confirmReset()} isLoading={isSubmitting} disabled={newPassword.length < 8}>Reset password</Button>
          </FormActions>
        </Card>
      ) : null}

      <DataTable
        headers={['Email', 'Name', 'Role', 'Active', 'Last login', 'Actions']}
        rows={admins.map((admin) => [
          admin.email,
          admin.displayName ?? '—',
          adminRoleLabels[admin.role] ?? admin.role,
          admin.isActive ? 'Yes' : 'No',
          admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never',
          admin.id === currentAdminId ? (
            <span key={admin.id} className="text-sm font-medium text-ink-muted">Current user</span>
          ) : (
            <div key={admin.id} className="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setEditAdmin(admin); setEditRole(admin.role); setEditDisplayName(admin.displayName ?? ''); }}>Edit</Button>
              <Button size="sm" variant="secondary" onClick={() => setResetAdmin(admin)}>Reset password</Button>
              <Button size="sm" variant="ghost" onClick={() => setDeactivateAdmin(admin)}>
                {admin.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          ),
        ])}
      />

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
