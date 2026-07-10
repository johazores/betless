'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; error: string };
type Tab = 'dashboard' | 'users' | 'points' | 'chain' | 'config' | 'flags' | 'audit' | 'admins';

type AdminSession = {
  admin: { id: string; email: string; role: string; permissions: string[] };
  accessToken: string;
};

type Analytics = {
  metrics: Record<string, number>;
  userGrowth: Array<{ date: string; registrations: number }>;
  environment: Record<string, unknown>;
};

type UserRow = {
  id: string;
  email: string | null;
  displayName: string | null;
  status: string;
  verificationStatus: string;
  createdAt: string;
  lastSeenAt: string | null;
  lockedBalance: number;
  pointsBalance: number;
};

function formatNumber(value: number) {
  return value.toLocaleString('en-PH');
}

function formatPeso(value: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value);
}

export function AdminClient() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminSession['admin'] | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [chain, setChain] = useState<any>(null);
  const [config, setConfig] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const can = useCallback((permission: string) => admin?.permissions.includes(permission), [admin]);

  const api = useCallback(async <T,>(url: string, init?: RequestInit): Promise<T> => {
    const token = accessToken ?? localStorage.getItem('betless_admin_access');
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
    const payload = (await response.json()) as ApiSuccess<T> | ApiFailure;
    if (!response.ok || !payload.ok) throw new Error(payload.ok ? 'Request failed.' : payload.error);
    return payload.data;
  }, [accessToken]);

  const refresh = useCallback(async () => {
    const response = await fetch('/api/admin/auth/refresh', { method: 'POST' });
    const payload = (await response.json()) as ApiSuccess<AdminSession> | ApiFailure;
    if (!response.ok || !payload.ok) throw new Error(payload.ok ? 'Refresh failed.' : payload.error);
    localStorage.setItem('betless_admin_access', payload.data.accessToken);
    setAccessToken(payload.data.accessToken);
    setAdmin(payload.data.admin);
  }, []);

  const load = useCallback(async () => {
    setError('');
    try {
      if (!localStorage.getItem('betless_admin_access')) await refresh();
      const loaded = await Promise.all([
        api<Analytics>('/api/admin/analytics'),
        api<{ users: UserRow[] }>('/api/admin/users'),
        api<any>('/api/admin/on-chain'),
        api<any[]>('/api/admin/config'),
        api<any[]>('/api/admin/feature-flags'),
        api<any[]>('/api/admin/audit'),
      ]);
      setAnalytics(loaded[0]);
      setUsers(loaded[1].users);
      setChain(loaded[2]);
      setConfig(loaded[3]);
      setFlags(loaded[4]);
      setAudit(loaded[5]);
      if (can('MANAGE_ADMINS')) {
        setAdmins(await api<any[]>('/api/admin/admin-users'));
      }
    } catch (loadError) {
      try {
        await refresh();
      } catch {
        router.replace('/admin/login');
        return;
      }
      setError(loadError instanceof Error ? loadError.message : 'Admin data could not be loaded.');
    }
  }, [api, can, refresh, router]);

  useEffect(() => {
    const token = localStorage.getItem('betless_admin_access');
    if (token) setAccessToken(token);
    void load();
  }, [load]);

  async function logout() {
    try {
      await api('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // The local token still gets cleared.
    }
    localStorage.removeItem('betless_admin_access');
    router.replace('/admin/login');
  }

  async function searchUsers(event: FormEvent) {
    event.preventDefault();
    const result = await api<{ users: UserRow[] }>(`/api/admin/users?q=${encodeURIComponent(userQuery)}`);
    setUsers(result.users);
  }

  async function openUser(id: string) {
    setSelectedUser(await api(`/api/admin/users/${id}`));
    setActiveTab('users');
  }

  async function adjustPoints(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      appUserId: String(form.get('appUserId') ?? ''),
      points: Number(form.get('points') ?? 0),
      reason: String(form.get('reason') ?? ''),
    };
    await api('/api/admin/points/adjust', { method: 'POST', body: JSON.stringify(payload) });
    setMessage('Point adjustment saved and audited.');
    await load();
  }

  async function bulkPoints(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      emails: String(form.get('emails') ?? ''),
      points: Number(form.get('points') ?? 0),
      reason: String(form.get('reason') ?? ''),
    };
    const result = await api<any>('/api/admin/points/bulk', { method: 'POST', body: JSON.stringify(payload) });
    setMessage(`Bulk adjustment complete. Adjusted ${result.adjusted}; missing ${result.missing.length}.`);
    await load();
  }

  async function updateConfig(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api('/api/admin/config', {
      method: 'POST',
      body: JSON.stringify({ key: form.get('key'), value: form.get('value') }),
    });
    setMessage('Config updated and audited.');
    setConfig(await api<any[]>('/api/admin/config'));
  }

  async function updateFlag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api('/api/admin/feature-flags', {
      method: 'POST',
      body: JSON.stringify({
        key: form.get('key'),
        enabled: form.get('enabled') === 'on',
        description: form.get('description'),
      }),
    });
    setMessage('Feature flag saved.');
    setFlags(await api<any[]>('/api/admin/feature-flags'));
  }

  async function retryOperation(id: string) {
    const reason = window.prompt('Reason for retry');
    if (reason == null) return;
    await api(`/api/admin/on-chain/${id}/retry`, {
      method: 'POST',
      body: JSON.stringify({ confirmation: 'RETRY', reason }),
    });
    setMessage('Retry submitted and audited.');
    setChain(await api('/api/admin/on-chain'));
  }

  const nav = useMemo(() => [
    ['dashboard', 'Dashboard'],
    ['users', 'Users'],
    ['points', 'Points'],
    ['chain', 'On-chain'],
    ['config', 'Config'],
    ['flags', 'Flags'],
    ['audit', 'Audit'],
    ['admins', 'Admins'],
  ] as Array<[Tab, string]>, []);

  if (!admin) {
    return <main className="min-h-screen bg-[#0f172a] p-6 text-white">Loading admin...</main>;
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100">
      <header className="border-b border-white/10 bg-[#111827]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-300">Betless Admin</p>
            <h1 className="text-2xl font-black">Internal operations</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-md border border-white/10 px-3 py-2">{admin.email}</span>
            <span className="rounded-md border border-brand-400/30 bg-brand-400/10 px-3 py-2 text-brand-100">{admin.role}</span>
            <button className="rounded-md bg-white px-3 py-2 text-ink" onClick={() => void logout()}>Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-md border border-white/10 bg-white/5 p-2">
          {nav.map(([id, label]) => (
            <button
              key={id}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm font-bold ${activeTab === id ? 'bg-white text-ink' : 'text-slate-300 hover:bg-white/10'}`}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </button>
          ))}
        </aside>

        <section className="space-y-4">
          {error ? <Notice tone="error">{error}</Notice> : null}
          {message ? <Notice>{message}</Notice> : null}
          {activeTab === 'dashboard' && analytics ? <Dashboard analytics={analytics} /> : null}
          {activeTab === 'users' ? (
            <Panel title="User management">
              <form onSubmit={searchUsers} className="flex gap-2">
                <input className="min-w-0 flex-1 rounded-md border border-white/10 bg-white px-3 py-2 text-ink" value={userQuery} onChange={(event) => setUserQuery(event.target.value)} placeholder="Search email, name, Clerk id" />
                <button className="rounded-md bg-brand-300 px-4 py-2 font-black text-ink">Search</button>
              </form>
              <DataTable
                headers={['User', 'Status', 'Locked', 'Points', 'Created']}
                rows={users.map((user) => [
                  <button className="text-left font-black text-brand-200" onClick={() => void openUser(user.id)}>{user.email ?? user.id}<br /><span className="font-semibold text-slate-400">{user.displayName}</span></button>,
                  `${user.status} / ${user.verificationStatus}`,
                  formatPeso(user.lockedBalance),
                  formatNumber(user.pointsBalance),
                  new Date(user.createdAt).toLocaleDateString(),
                ])}
              />
              {selectedUser ? <UserDetail user={selectedUser} /> : null}
            </Panel>
          ) : null}
          {activeTab === 'points' ? (
            <Panel title="Points management">
              <div className="grid gap-4 lg:grid-cols-2">
                <PointForm users={users} onSubmit={adjustPoints} />
                <BulkPointForm onSubmit={bulkPoints} />
              </div>
            </Panel>
          ) : null}
          {activeTab === 'chain' && chain ? (
            <Panel title="On-chain management">
              <div className="grid gap-3 md:grid-cols-3">
                {Object.entries(chain.health).map(([key, value]) => <Metric key={key} label={key} value={String(value)} />)}
              </div>
              <DataTable
                headers={['Operation', 'User', 'Amount', 'State', 'Tx', 'Action']}
                rows={chain.operations.map((op: any) => [
                  `${op.kind}\n${op.vaultId}`,
                  op.userEmail ?? 'Unknown',
                  formatPeso(op.amount),
                  op.state,
                  op.explorerUrl ? <a className="text-brand-200" href={op.explorerUrl} target="_blank">Explorer</a> : op.errorMessage ?? 'No tx',
                  can('RETRY_ON_CHAIN') && op.state !== 'CONFIRMED' ? <button className="rounded bg-white px-2 py-1 text-xs font-black text-ink" onClick={() => void retryOperation(op.id)}>Retry</button> : 'Read only',
                ])}
              />
            </Panel>
          ) : null}
          {activeTab === 'config' ? (
            <Panel title="Managed runtime config">
              <ConfigForm config={config} onSubmit={updateConfig} />
              <DataTable
                headers={['Key', 'Value', 'Source', 'Secret', 'Updated']}
                rows={config.map((item) => [item.key, item.value ?? 'Unset', item.source, item.isSecret ? 'Masked' : 'Plain', item.updatedAt ?? 'Never'])}
              />
            </Panel>
          ) : null}
          {activeTab === 'flags' ? (
            <Panel title="Feature flags">
              <FlagForm onSubmit={updateFlag} />
              <DataTable headers={['Key', 'Enabled', 'Description']} rows={flags.map((flag) => [flag.key, flag.enabled ? 'On' : 'Off', flag.description ?? ''])} />
            </Panel>
          ) : null}
          {activeTab === 'audit' ? (
            <Panel title="Audit logs">
              <DataTable headers={['Time', 'Admin', 'Action', 'Target', 'Reason']} rows={audit.map((log) => [new Date(log.createdAt).toLocaleString(), log.adminEmail ?? 'System', log.action, `${log.targetType ?? ''} ${log.targetId ?? ''}`, log.reason ?? ''])} />
            </Panel>
          ) : null}
          {activeTab === 'admins' ? (
            <Panel title="Admin users">
              <DataTable headers={['Email', 'Role', 'Active', 'Last login']} rows={admins.map((row) => [row.email, row.role, row.isActive ? 'Yes' : 'No', row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : 'Never'])} />
            </Panel>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function Dashboard({ analytics }: { analytics: Analytics }) {
  const metrics = analytics.metrics;
  return (
    <Panel title="Analytics dashboard">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Metric label="Total users" value={formatNumber(metrics.totalUsers)} />
        <Metric label="Active users" value={formatNumber(metrics.activeUsers)} />
        <Metric label="Locked balance" value={formatPeso(metrics.lockedBalance)} />
        <Metric label="Points issued" value={formatNumber(metrics.pointsIssued)} />
        <Metric label="Points redeemed" value={formatNumber(metrics.pointsRedeemed)} />
        <Metric label="Vaults" value={formatNumber(metrics.allVaults)} />
        <Metric label="Active vaults" value={formatNumber(metrics.activeVaults)} />
        <Metric label="On-chain ops" value={formatNumber(metrics.stellarOps)} />
        <Metric label="Failed ops" value={formatNumber(metrics.failedOps)} />
      </div>
      <div className="mt-4 rounded-md border border-white/10 bg-[#0b1220] p-4">
        <p className="text-sm font-black">Registrations, last 30 days</p>
        <div className="mt-3 flex h-32 items-end gap-1">
          {analytics.userGrowth.map((day) => (
            <div key={day.date} title={`${day.date}: ${day.registrations}`} className="flex flex-1 items-end">
              <div className="w-full rounded-t bg-brand-300" style={{ height: `${Math.max(4, day.registrations * 18)}px` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {Object.entries(analytics.environment).map(([key, value]) => <Metric key={key} label={key} value={String(value)} />)}
      </div>
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-4 shadow-card">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-[#0b1220] p-3">
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 break-words text-lg font-black">{value}</p>
    </div>
  );
}

function Notice({ children, tone = 'success' }: { children: React.ReactNode; tone?: 'success' | 'error' }) {
  return <div className={`rounded-md p-3 text-sm font-bold ${tone === 'error' ? 'bg-danger text-white' : 'bg-success text-white'}`}>{children}</div>;
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-white/10">
      <table className="min-w-full divide-y divide-white/10 text-sm">
        <thead className="bg-white/10 text-left text-xs uppercase text-slate-300">
          <tr>{headers.map((header) => <th key={header} className="px-3 py-2">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => <td key={cellIndex} className="whitespace-pre-line px-3 py-2 align-top">{cell}</td>)}
            </tr>
          ))}
          {rows.length === 0 ? <tr><td className="px-3 py-4 text-slate-400" colSpan={headers.length}>No records</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

function UserDetail({ user }: { user: any }) {
  return (
    <div className="rounded-md border border-white/10 bg-[#0b1220] p-4">
      <h3 className="font-black">{user.email ?? user.id}</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <Metric label="Points" value={formatNumber(user.pointsBalance)} />
        <Metric label="Locked" value={formatPeso(user.lockedBalance)} />
        <Metric label="Status" value={user.status} />
        <Metric label="Verification" value={user.verificationStatus} />
      </div>
      <h4 className="mt-4 font-black">Vaults</h4>
      <DataTable headers={['Vault', 'Amount', 'Status', 'Matures', 'Claimable balance']} rows={user.vaults.map((vault: any) => [vault.id, formatPeso(vault.principal), vault.status, new Date(vault.maturesAt).toLocaleDateString(), vault.claimableBalanceId ?? 'None'])} />
    </div>
  );
}

function PointForm({ users, onSubmit }: { users: UserRow[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="rounded-md border border-white/10 bg-[#0b1220] p-4">
      <h3 className="font-black">Single adjustment</h3>
      <select name="appUserId" className="mt-3 w-full rounded-md px-3 py-2 text-ink">
        {users.map((user) => <option key={user.id} value={user.id}>{user.email ?? user.id}</option>)}
      </select>
      <input name="points" className="mt-3 w-full rounded-md px-3 py-2 text-ink" type="number" placeholder="Points, use negative to deduct" />
      <input name="reason" className="mt-3 w-full rounded-md px-3 py-2 text-ink" placeholder="Reason" />
      <button className="mt-3 rounded-md bg-brand-300 px-4 py-2 font-black text-ink">Save adjustment</button>
    </form>
  );
}

function BulkPointForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="rounded-md border border-white/10 bg-[#0b1220] p-4">
      <h3 className="font-black">Bulk adjustment</h3>
      <textarea name="emails" className="mt-3 min-h-28 w-full rounded-md px-3 py-2 text-ink" placeholder="Emails separated by comma or newline" />
      <input name="points" className="mt-3 w-full rounded-md px-3 py-2 text-ink" type="number" placeholder="Points" />
      <input name="reason" className="mt-3 w-full rounded-md px-3 py-2 text-ink" placeholder="Reason" />
      <button className="mt-3 rounded-md bg-brand-300 px-4 py-2 font-black text-ink">Run bulk grant</button>
    </form>
  );
}

function ConfigForm({ config, onSubmit }: { config: any[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-md border border-white/10 bg-[#0b1220] p-4 md:grid-cols-[1fr_1fr_auto]">
      <select name="key" className="rounded-md px-3 py-2 text-ink">
        {config.filter((item) => !item.bootCritical).map((item) => <option key={item.key} value={item.key}>{item.key}</option>)}
      </select>
      <input name="value" className="rounded-md px-3 py-2 text-ink" placeholder="New value" />
      <button className="rounded-md bg-brand-300 px-4 py-2 font-black text-ink">Update config</button>
    </form>
  );
}

function FlagForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-md border border-white/10 bg-[#0b1220] p-4 md:grid-cols-[1fr_1fr_auto_auto]">
      <input name="key" className="rounded-md px-3 py-2 text-ink" placeholder="flag_key" />
      <input name="description" className="rounded-md px-3 py-2 text-ink" placeholder="Description" />
      <label className="flex items-center gap-2 text-sm font-bold"><input name="enabled" type="checkbox" /> Enabled</label>
      <button className="rounded-md bg-brand-300 px-4 py-2 font-black text-ink">Save flag</button>
    </form>
  );
}
