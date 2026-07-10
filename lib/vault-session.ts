const VAULT_TOKEN_PREFIX = 'betless:vault-token:';

export function saveVaultToken(vaultId: string, accessToken?: string | null) {
  if (typeof window === 'undefined' || !accessToken) return;
  window.localStorage.setItem(`${VAULT_TOKEN_PREFIX}${vaultId}`, accessToken);
}

export function getVaultToken(vaultId: string) {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(`${VAULT_TOKEN_PREFIX}${vaultId}`);
}

export function clearVaultToken(vaultId: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(`${VAULT_TOKEN_PREFIX}${vaultId}`);
}
