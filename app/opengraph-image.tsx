import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site';

export const runtime = 'edge';
export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
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
          background: 'linear-gradient(145deg, #fffbeb 0%, #ffffff 45%, #f8fafc 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: 6,
              paddingBottom: 14,
            }}
          >
            <div style={{ width: 10, height: 22, borderRadius: 5, background: '#fff', opacity: 0.95 }} />
            <div style={{ width: 10, height: 30, borderRadius: 5, background: '#fff', opacity: 0.88 }} />
            <div style={{ width: 10, height: 38, borderRadius: 5, background: '#fff', opacity: 0.8 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: -1 }}>
              Bet<span style={{ color: '#d97706' }}>less</span>
            </span>
            <span style={{ fontSize: 22, color: '#64748b', fontWeight: 600, marginTop: 4 }}>
              {siteConfig.tagline}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900 }}>
          <span style={{ fontSize: 58, fontWeight: 900, color: '#0f172a', lineHeight: 1.05, letterSpacing: -2 }}>
            Save with discipline.
            <br />
            Earn rewards you&apos;ll use.
          </span>
          <span style={{ fontSize: 26, color: '#475569', lineHeight: 1.45, fontWeight: 500 }}>
            Lock savings, earn monthly points, and get your full deposit back at maturity.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {['Stellar-verified locks', 'Monthly points', 'Partner rewards'].map((label) => (
            <div
              key={label}
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                color: '#9a3412',
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
