import type { NextApiRequest, NextApiResponse } from 'next';
import { requireApiUserId } from '@/lib/auth';
import { requireMethod } from '@/lib/api-methods';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { validateCreateVaultRequest } from '@/lib/validators';
import { StellarProofService } from '@/services/stellar-proof-service';
import { VaultService } from '@/services/vault-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const clerkUserId = await requireApiUserId(req);

    if (req.method === 'GET') {
      const vaults = await VaultService.listVaults(clerkUserId);
      return sendSuccess(res, vaults);
    }

    if (!requireMethod(req, res, 'POST')) return;

    const input = validateCreateVaultRequest(req.body);
    const createdVault = await VaultService.createVault(input, clerkUserId);
    await StellarProofService.createOrUpdateCommitmentProof(createdVault.id, clerkUserId);
    const vault = await VaultService.refreshVaultDetail(createdVault.id, clerkUserId);
    return sendSuccess(res, vault, 201);
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message === 'Please sign in to continue.' ? 401 : 400);
  }
}
