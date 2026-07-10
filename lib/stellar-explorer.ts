import { Networks } from '@stellar/stellar-sdk';

export const StellarNetwork = {
  TESTNET: 'TESTNET',
  PUBLIC: 'PUBLIC',
} as const;

export type StellarNetwork = (typeof StellarNetwork)[keyof typeof StellarNetwork];

export function normalizeStellarNetwork(value?: string | null): StellarNetwork {
  const normalized = (value ?? '').trim().toLowerCase();

  if (normalized === 'public' || normalized === 'mainnet' || normalized === 'pubnet') {
    return StellarNetwork.PUBLIC;
  }

  return StellarNetwork.TESTNET;
}

export function getConfiguredStellarNetwork(): StellarNetwork {
  return normalizeStellarNetwork(process.env.STELLAR_NETWORK ?? process.env.NEXT_PUBLIC_STELLAR_NETWORK);
}

export function getStellarNetworkLabel(network: StellarNetwork) {
  return network === StellarNetwork.PUBLIC ? 'Stellar Mainnet' : 'Stellar Testnet';
}

export function getStellarNetworkSlug(network: StellarNetwork) {
  return network === StellarNetwork.PUBLIC ? 'public' : 'testnet';
}

export function getStellarNetworkPassphrase(network: StellarNetwork) {
  return network === StellarNetwork.PUBLIC ? Networks.PUBLIC : Networks.TESTNET;
}

export function buildStellarAccountExplorerUrl(accountId: string, network: StellarNetwork = getConfiguredStellarNetwork()) {
  return `https://stellar.expert/explorer/${getStellarNetworkSlug(network)}/account/${accountId}`;
}

export function buildStellarTransactionExplorerUrl(transactionHash: string, network: StellarNetwork = getConfiguredStellarNetwork()) {
  return `https://stellar.expert/explorer/${getStellarNetworkSlug(network)}/tx/${transactionHash}`;
}

export function buildStellarOperationExplorerUrl(operationId: string, network: StellarNetwork = getConfiguredStellarNetwork()) {
  return `https://stellar.expert/explorer/${getStellarNetworkSlug(network)}/op/${operationId}`;
}
