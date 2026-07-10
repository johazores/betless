'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminAuthShell } from '@/components/layout/admin-auth-shell';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { setAdminAccessToken } from '@/lib/admin-api-client';
import type { ApiFailure, ApiSuccess } from '@/lib/api-response';

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
      setAdminAccessToken(payload.data.accessToken);
      router.replace('/admin');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AdminAuthShell
      badge="Betless internal"
      title="Admin sign in"
      subtitle="Separate JWT access for platform operations. Use your assigned administrator credentials."
      highlights={[
        ['Role-based access', 'Each administrator sees only the tabs and actions their role permits.'],
        ['Full audit trail', 'Every change is logged with reason, IP, and operator identity.'],
        ['Secure sessions', 'Short-lived access tokens with HttpOnly refresh cookie rotation.'],
      ]}
    >
      <Card padding="lg">
        <form onSubmit={submit} className="space-y-4">
          {error ? <Alert tone="error" title="Sign in failed">{error}</Alert> : null}

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign in
          </Button>
        </form>
      </Card>
    </AdminAuthShell>
  );
}
