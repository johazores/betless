import { Asset, Horizon, Keypair, Networks } from '@stellar/stellar-sdk';

/**
 * Server-side Stellar configuration. The on-chain settlement layer is optional:
 * when the treasury/ops/asset variables are absent the app runs entirely
 * off-chain and every StellarService call is a no-op.
 */

export const StellarNetwork = {
  TESTNET: 'TESTNET',
  PUBLIC: 'PUBLIC',
} as const;

export type StellarNetwork = (typeof StellarNetwork)[keyof typeof StellarNetwork];

export function getStellarNetwork(): StellarNetwork {
  const raw = (process.env.STELLAR_NETWORK ?? '').trim().toLowerCase();
  return raw === 'public' || raw === 'mainnet' || raw === 'pubnet'
    ? StellarNetwork.PUBLIC
    : StellarNetwork.TESTNET;
}

export function getNetworkPassphrase() {
  return getStellarNetwork() === StellarNetwork.PUBLIC ? Networks.PUBLIC : Networks.TESTNET;
}

export function getHorizonUrl() {
  const override = process.env.STELLAR_HORIZON_URL?.trim();
  if (override) return override;
  return getStellarNetwork() === StellarNetwork.PUBLIC
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org';
}

export function getHorizonServer() {
  return new Horizon.Server(getHorizonUrl());
}

export function isStellarEnabled() {
  return Boolean(
    process.env.STELLAR_TREASURY_SECRET?.trim() &&
      process.env.STELLAR_OPS_SECRET?.trim() &&
      process.env.STELLAR_ASSET_ISSUER?.trim(),
  );
}

/** Holds the float and creates/claims vault locks. Time-locked claimant. */
export function getTreasuryKeypair() {
  return Keypair.fromSecret(process.env.STELLAR_TREASURY_SECRET!.trim());
}

/** Unconditional claimant used only for early-withdrawal settlement. */
export function getOpsKeypair() {
  return Keypair.fromSecret(process.env.STELLAR_OPS_SECRET!.trim());
}

/** Peso-pegged settlement asset (1 unit = ₱1). PHPC test issue on testnet. */
export function getVaultAsset() {
  const code = process.env.STELLAR_ASSET_CODE?.trim() || 'PHPC';
  return new Asset(code, process.env.STELLAR_ASSET_ISSUER!.trim());
}

function explorerBase() {
  return `https://stellar.expert/explorer/${getStellarNetwork() === StellarNetwork.PUBLIC ? 'public' : 'testnet'}`;
}

export function buildTransactionExplorerUrl(txHash: string) {
  return `${explorerBase()}/tx/${txHash}`;
}

export function buildAccountExplorerUrl(accountId: string) {
  return `${explorerBase()}/account/${accountId}`;
}

/** Public treasury address for proof-of-reserves pages. Null when Stellar is off. */
export function getTreasuryPublicKey() {
  if (!isStellarEnabled()) return null;
  return getTreasuryKeypair().publicKey();
}
