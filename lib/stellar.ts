import { Networks, StrKey } from '@stellar/stellar-sdk';

export const STELLAR_NETWORK_LABEL = 'Stellar Testnet';
export const STELLAR_NETWORK_PASSPHRASE = Networks.TESTNET;

export function isValidStellarPublicKey(value: string) {
  try {
    return StrKey.isValidEd25519PublicKey(value);
  } catch {
    return false;
  }
}
