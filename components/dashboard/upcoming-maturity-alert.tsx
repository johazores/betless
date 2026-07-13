'use client';

import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { formatShortDate, daysUntil } from '@/lib/dates';
import { formatPeso } from '@/lib/money';
import type { VaultView } from '@/types/vault';

export function UpcomingMaturityAlert({ vaults }: { vaults: VaultView[] }) {
  const soon = vaults
    .filter((vault) => vault.status === 'ACTIVE')
    .map((vault) => ({ vault, daysLeft: daysUntil(vault.maturesAt) }))
    .filter(({ daysLeft }) => daysLeft >= 0 && daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (soon.length === 0) return null;

  const next = soon[0];
  const label = next.vault.goalLabel ?? `${next.vault.lockMonths}-month vault`;

  return (
    <Alert title="Vault maturing soon" tone="info">
      <span className="font-semibold text-ink">{label}</span>
      {' '}({formatPeso(next.vault.principal)}) matures{' '}
      {next.daysLeft === 0 ? 'today' : `in ${next.daysLeft} day${next.daysLeft === 1 ? '' : 's'}`}
      {' '}on {formatShortDate(next.vault.maturesAt)}. Your full deposit will be returned automatically.
      {soon.length > 1 ? ` ${soon.length - 1} more vault${soon.length === 2 ? '' : 's'} maturing within 30 days.` : ''}
      {' '}
      <Link href={`/vaults/${next.vault.id}`} className="font-bold text-brand-800 hover:text-brand-900">
        View vault →
      </Link>
    </Alert>
  );
}
