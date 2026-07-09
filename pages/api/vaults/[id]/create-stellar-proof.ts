import type { NextApiRequest, NextApiResponse } from 'next';
import { requireMethod } from '@/lib/api-methods';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { getSingleQueryValue } from '@/lib/validators';
import { StellarProofService } from '@/services/stellar-proof-service';
import { VaultService } from '@/services/vault-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'POST')) return;

  const id = getSingleQueryValue(req.query.id);

  if (!id) {
    return sendError(res, 'Vault ID is required.', 400);
  }

  try {
    await StellarProofService.createOrUpdateCommitmentProof(id);
    const vault = await VaultService.refreshVaultDetail(id);
    return sendSuccess(res, vault);
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
