import type { Metadata } from 'next';
import { JoinClient } from './join-client';
import { createMetadata } from '@/lib/seo';
import { REFERRAL_BONUS_POINTS } from '@/lib/referrals';
import { getSiteUrl } from '@/lib/site';

/**
 * Direct referral invite link (/join/CODE). Public: it stashes the code in the
 * browser and forwards the visitor to sign-up; the code is claimed automatically
 * on their first signed-in page.
 */
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const inviteCode = decodeURIComponent(code).trim().toUpperCase();
  const path = `/join/${encodeURIComponent(inviteCode)}`;

  return createMetadata({
    absoluteTitle: `Join Betless — earn ₱${REFERRAL_BONUS_POINTS.toLocaleString('en-PH')} with invite ${inviteCode}`,
    description: `You've been invited to Betless. Sign up with invite code ${inviteCode} and you both earn ₱${REFERRAL_BONUS_POINTS.toLocaleString('en-PH')} in points.`,
    path,
    openGraph: {
      type: 'website',
      url: `${getSiteUrl()}${path}`,
      title: `Join Betless with invite ${inviteCode}`,
      description: `Sign up and you both earn ₱${REFERRAL_BONUS_POINTS.toLocaleString('en-PH')} in points.`,
      images: [
        {
          url: `/join/${encodeURIComponent(inviteCode)}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `Betless referral invite ${inviteCode}`,
        },
      ],
    },
  });
}

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  return <JoinClient code={code} />;
}
