import type { ApiFailure, ApiSuccess } from '@/lib/api-response';

const ACCESS_TOKEN_KEY = 'betless_admin_access';

type AdminSession = {
  admin: { id: string; email: string; role: string; permissions: string[] };
  accessToken: string;
};

type ApiPayload<T> = ApiSuccess<T> | ApiFailure;

export function getAdminAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAdminAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAdminAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

async function parseResponse<T>(response: Response): Promise<T> {
  let payload: ApiPayload<T> | null = null;
  try {
    payload = (await response.json()) as ApiPayload<T>;
  } catch {
    throw new Error('The server returned an unreadable response.');
  }
  if (!response.ok || !payload?.ok) {
    throw new Error(payload && !payload.ok ? payload.error : 'Request failed.');
  }
  return payload.data;
}

async function refreshAdminSession(): Promise<AdminSession> {
  const response = await fetch('/api/admin/auth/refresh', { method: 'POST' });
  const data = await parseResponse<AdminSession>(response);
  setAdminAccessToken(data.accessToken);
  return data;
}

export async function adminApiRequest<T>(url: string, init?: RequestInit, retried = false): Promise<T> {
  const token = getAdminAccessToken();
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 401 && !retried) {
    await refreshAdminSession();
    return adminApiRequest<T>(url, init, true);
  }

  return parseResponse<T>(response);
}

export function adminPostJson<T>(url: string, body: Record<string, unknown> = {}) {
  return adminApiRequest<T>(url, { method: 'POST', body: JSON.stringify(body) });
}

export function adminPatchJson<T>(url: string, body: Record<string, unknown> = {}) {
  return adminApiRequest<T>(url, { method: 'PATCH', body: JSON.stringify(body) });
}

export function adminDelete<T>(url: string) {
  return adminApiRequest<T>(url, { method: 'DELETE' });
}

export async function fetchAdminSession(): Promise<AdminSession> {
  const token = getAdminAccessToken();
  if (token) {
    try {
      const me = await adminApiRequest<{ admin: AdminSession['admin'] }>('/api/admin/auth/me');
      return { admin: me.admin, accessToken: token };
    } catch {
      return refreshAdminSession();
    }
  }
  return refreshAdminSession();
}

export async function logoutAdmin() {
  try {
    await adminApiRequest('/api/admin/auth/logout', { method: 'POST' });
  } catch {
    // Local token is still cleared.
  }
  clearAdminAccessToken();
}

export const ADMIN_REFRESH_INTERVAL_MS = 12 * 60 * 1000;
