const VAULT_TOKEN_PREFIX = 'betless:vault-token:';
const GUEST_SESSION_TOKEN_KEY = 'betless:guest-session-token';

function createBrowserToken() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function getGuestSessionToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(GUEST_SESSION_TOKEN_KEY);
}

export function getOrCreateGuestSessionToken() {
  if (typeof window === 'undefined') return null;

  const existingToken = window.localStorage.getItem(GUEST_SESSION_TOKEN_KEY);
  if (existingToken) return existingToken;

  const token = createBrowserToken();
  window.localStorage.setItem(GUEST_SESSION_TOKEN_KEY, token);
  return token;
}

export function saveGuestSessionToken(accessToken?: string | null) {
  if (typeof window === 'undefined' || !accessToken) return;
  window.localStorage.setItem(GUEST_SESSION_TOKEN_KEY, accessToken);
}

export function clearGuestSessionToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(GUEST_SESSION_TOKEN_KEY);
}

export function saveVaultToken(vaultId: string, accessToken?: string | null) {
  if (typeof window === 'undefined' || !accessToken) return;
  window.localStorage.setItem(`${VAULT_TOKEN_PREFIX}${vaultId}`, accessToken);
  saveGuestSessionToken(accessToken);
}

export function getVaultToken(vaultId: string) {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(`${VAULT_TOKEN_PREFIX}${vaultId}`) ?? getGuestSessionToken();
}

export function clearVaultToken(vaultId: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(`${VAULT_TOKEN_PREFIX}${vaultId}`);
}
