export type TransparencyView = {
  enabled: boolean;
  networkLabel: string;
  treasuryAccountId: string | null;
  treasuryExplorerUrl: string | null;
  assetCode: string | null;
  lastCheckedAt: string;
  db: {
    activeVaults: number;
    lockedPrincipal: number;
    verifiedLocks: number;
  };
  chain: {
    claimableBalances: number;
    lockedPrincipal: number;
  } | null;
  reconciliation: {
    status: 'matched' | 'pending' | 'mismatch' | 'unavailable';
    message: string;
    unmatchedDbVaults: number;
    unmatchedChainBalances: number;
  };
};

export type PublicStatsView = {
  activeVaults: number;
  lockedPrincipal: number;
  verifiedOnChain: number;
  stellarEnabled: boolean;
  networkLabel: string;
};
