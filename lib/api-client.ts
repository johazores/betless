import type { ApiFailure, ApiSuccess } from '@/lib/api-response';

type ApiPayload<T> = ApiSuccess<T> | ApiFailure;

/**
 * Fetch wrapper for the Betless API. Authentication rides on the Clerk
 * session cookie, so no tokens are attached client-side.
 */
export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
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

export function postJson<T>(url: string, body: Record<string, unknown> = {}) {
  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function patchJson<T>(url: string, body: Record<string, unknown> = {}) {
  return apiRequest<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
