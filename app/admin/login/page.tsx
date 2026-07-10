'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; error: string };

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json()) as ApiSuccess<{ accessToken: string }> | ApiFailure;
      if (!response.ok || !payload.ok) throw new Error(payload.ok ? 'Login failed.' : payload.error);
      localStorage.setItem('betless_admin_access', payload.data.accessToken);
      router.replace('/admin');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0f172a] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <form onSubmit={submit} className="w-full rounded-lg border border-white/10 bg-white p-6 text-ink shadow-elevated">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-700">Betless internal</p>
          <h1 className="mt-3 text-3xl font-black">Admin sign in</h1>
          <p className="mt-2 text-sm leading-6 text-ink-muted">Separate JWT access for platform operations.</p>

          {error ? <p className="mt-5 rounded-md bg-danger-surface p-3 text-sm font-semibold text-danger">{error}</p> : null}

          <label className="mt-6 block text-sm font-bold">
            Email
            <input
              className="mt-2 w-full rounded-md border border-line px-3 py-2"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="mt-4 block text-sm font-bold">
            Password
            <input
              className="mt-2 w-full rounded-md border border-line px-3 py-2"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button
            className="mt-6 w-full rounded-md bg-ink px-4 py-3 text-sm font-black text-white disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
