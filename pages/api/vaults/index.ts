import type { NextApiRequest, NextApiResponse } from 'next';
import { createVaultAccessToken, getApiVaultAccess, getVaultAccessToken, hashVaultAccessToken } from '@/lib/auth';
import { requireMethod } from '@/lib/api-methods';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { validateCreateVaultRequest } from '@/lib/validators';
import { StellarProofService } from '@/services/stellar-proof-service';
import { VaultFundingService } from '@/services/vault-funding-service';
import { VaultService } from '@/services/vault-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const access = await getApiVaultAccess(req);
      const vaults = await VaultService.listVaults(access);
      return sendSuccess(res, vaults);
    }

    if (!requireMethod(req, res, 'POST')) return;

    const input = validateCreateVaultRequest(req.body);
    const requestAccess = await getApiVaultAccess(req);
    const existingGuestToken = requestAccess.clerkUserId ? null : getVaultAccessToken(req);
    const guestAccessToken = requestAccess.clerkUserId ? null : existingGuestToken ?? createVaultAccessToken();
    const access = {
      clerkUserId: requestAccess.clerkUserId,
      vaultAccessTokenHash: guestAccessToken ? hashVaultAccessToken(guestAccessToken) : null,
    };

    const createdVault = await VaultService.createVault(input, access);

    // Activate + fund the wallet on-ledger (Friendbot on testnet) so the proof
    // payment has a real destination account. Best-effort: creation must not
    // fail if the network is momentarily unavailable — the vault page exposes a
    // retry via POST /api/vaults/[id]/fund.
    try {
      await VaultFundingService.activateAndFund(createdVault.id, access);
    } catch {
      // stellarError is persisted inside the service; continue.
    }

    try {
      await StellarProofService.createOrUpdateCommitmentProof(createdVault.id, access);
    } catch {
      // Proof failures are persisted as FAILED and retryable from the UI.
    }

    const vault = await VaultService.refreshVaultDetail(createdVault.id, access);
    return sendSuccess(res, { ...vault, accessToken: guestAccessToken }, 201);
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message.includes('sign in') ? 401 : 400);
  }
}
