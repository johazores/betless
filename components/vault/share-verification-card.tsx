'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type ShareVerificationCardProps = {
  verificationUrl: string;
  goalName: string | null;
};

export function ShareVerificationCard({ verificationUrl, goalName }: ShareVerificationCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const label = goalName ?? 'this vault';

  return (
    <Card>
      <h2 className="text-2xl font-black text-ink">Share with sender or family</h2>
      <p className="mt-2 text-sm leading-6 text-ink-muted">
        Send this link to anyone who sent remittance or wants to verify that {label} is locked on Stellar —
        no Betless account needed.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          readOnly
          value={verificationUrl}
          className="min-w-0 flex-1 rounded-xl border border-line bg-surface-muted px-4 py-3 font-mono text-xs text-ink"
          aria-label="Verification link"
        />
        <Button variant="secondary" onClick={handleCopy} className="shrink-0">
          {copied ? 'Copied!' : 'Copy link'}
        </Button>
      </div>
    </Card>
  );
}
