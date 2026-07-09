import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { getSingleQueryValue } from '@/lib/validators';
import { RewardService } from '@/services/reward-service';
import { VaultService } from '@/services/vault-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed.', 405);
  }

  const id = getSingleQueryValue(req.query.id);

  if (!id) {
    return sendError(res, 'Vault ID is required.', 400);
  }

  try {
    const rewardId = typeof req.body?.rewardId === 'string' ? req.body.rewardId : undefined;
    const voucher = await RewardService.claimReward(id, rewardId);
    const vault = await VaultService.refreshVaultDetail(id);
    return sendSuccess(res, { vault, voucher });
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
