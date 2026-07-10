import { ImageResponse } from 'next/og';
import { REFERRAL_BONUS_POINTS } from '@/lib/referrals';
import { siteConfig } from '@/lib/site';

export const runtime = 'edge';
export const alt = `Join ${siteConfig.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function JoinOpenGraphImage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const inviteCode = decodeURIComponent(code).trim().toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(145deg, #fffbeb 0%, #ffffff 50%, #f8fafc 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)',
            }}
          />
          <span style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{siteConfig.name}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <span style={{ fontSize: 56, fontWeight: 900, color: '#0f172a', lineHeight: 1.05, letterSpacing: -2 }}>
            You&apos;re invited to save smarter.
          </span>
          <span style={{ fontSize: 28, color: '#475569', lineHeight: 1.4, fontWeight: 500, maxWidth: 920 }}>
            Join with this invite and you both earn ₱{REFERRAL_BONUS_POINTS.toLocaleString('en-PH')} in points.
          </span>
        </div>

        <div
          style={{
            alignSelf: 'flex-start',
            padding: '16px 28px',
            borderRadius: 16,
            background: '#fff7ed',
            border: '2px solid #fdba74',
            color: '#9a3412',
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 4,
          }}
        >
          {inviteCode}
        </div>
      </div>
    ),
    { ...size },
  );
}
