import type { NextApiRequest } from 'next';
import { verifyToken } from '@clerk/backend';

function getBearerToken(req: NextApiRequest) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim();
}

export async function requireApiUserId(req: NextApiRequest) {
  const token = getBearerToken(req);

  if (!token) {
    throw new Error('Please sign in to continue.');
  }

  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!secretKey) {
    throw new Error('Clerk server key is missing. Add CLERK_SECRET_KEY to enable protected API access.');
  }

  try {
    const payload = await verifyToken(token, { secretKey });

    if (!payload.sub) {
      throw new Error('Session token is missing a user ID.');
    }

    return payload.sub;
  } catch {
    throw new Error('Please sign in again. Your session could not be verified.');
  }
}
