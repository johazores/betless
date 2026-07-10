import type { NextApiRequest } from 'next';
import { getAuth } from '@clerk/nextjs/server';

/**
 * Resolves the signed-in Clerk user for a Pages Router API request.
 * Session context is attached by clerkMiddleware (proxy.ts).
 */
export function requireApiUserId(req: NextApiRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    throw new Error('Please sign in to continue.');
  }

  return userId;
}
