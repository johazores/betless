import { JoinClient } from './join-client';

/**
 * Direct referral invite link (/join/CODE). Public: it stashes the code in the
 * browser and forwards the visitor to sign-up; the code is claimed automatically
 * on their first signed-in page.
 */
export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  return <JoinClient code={code} />;
}
