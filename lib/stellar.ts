import { StrKey } from '@stellar/stellar-sdk';
import { getConfiguredStellarNetwork, getStellarNetworkLabel, getStellarNetworkPassphrase } from '@/lib/stellar-explorer';

export const STELLAR_NETWORK_LABEL = getStellarNetworkLabel(getConfiguredStellarNetwork());
export const STELLAR_NETWORK_PASSPHRASE = getStellarNetworkPassphrase(getConfiguredStellarNetwork());

export function isValidStellarPublicKey(value: string) {
  try {
    return StrKey.isValidEd25519PublicKey(value);
  } catch {
    return false;
  }
}
