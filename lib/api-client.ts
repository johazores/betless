import type { ApiFailure, ApiSuccess } from '@/lib/api-response';

type ApiPayload<T> = ApiSuccess<T> | ApiFailure;

type ApiRequestOptions = {
  token?: string | null;
  vaultAccessToken?: string | null;
};

export async function apiRequest<T>(url: string, init?: RequestInit, options?: ApiRequestOptions | string | null): Promise<T> {
  const normalizedOptions: ApiRequestOptions = typeof options === 'string' || options === null
    ? { token: options }
    : options ?? {};

  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(normalizedOptions.token ? { Authorization: `Bearer ${normalizedOptions.token}` } : {}),
      ...(normalizedOptions.vaultAccessToken ? { 'x-vault-token': normalizedOptions.vaultAccessToken } : {}),
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

export function postJson<T>(url: string, body: Record<string, unknown>, options?: ApiRequestOptions | string | null) {
  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  }, options);
}
