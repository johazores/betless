import type { ApiFailure, ApiSuccess } from '@/lib/api-response';

type ApiPayload<T> = ApiSuccess<T> | ApiFailure;

export async function apiRequest<T>(url: string, init?: RequestInit, token?: string | null): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  let payload: ApiPayload<T> | null = null;

  try {
    payload = (await response.json()) as ApiPayload<T>;
  } catch {
    throw new Error('The server returned an unreadable response.');
  }

  if (!response.ok || !payload.ok) {
    throw new Error(payload && !payload.ok ? payload.error : 'Request failed.');
  }

  return payload.data;
}

export function postJson<T>(url: string, body: Record<string, unknown>, token?: string | null) {
  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  }, token);
}
