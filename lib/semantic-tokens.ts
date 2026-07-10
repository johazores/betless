/**
 * Semantic color roles — map UI meaning to design tokens.
 * Use these helpers instead of ad-hoc Tailwind colors in product UI.
 */

export type SemanticTone = 'brand' | 'neutral' | 'success' | 'info' | 'warning' | 'danger' | 'chain';

export const toneStyles: Record<
  SemanticTone,
  { badge: string; icon: string; surface: string; text: string; ring: string }
> = {
  brand: {
    badge: 'border-brand-200/80 bg-brand-50 text-brand-800',
    icon: 'bg-brand-100 text-brand-700',
    surface: 'border-brand-200/60 bg-brand-50/50',
    text: 'text-brand-800',
    ring: 'ring-brand-100',
  },
  neutral: {
    badge: 'border-line bg-surface-sunken text-ink-muted',
    icon: 'bg-surface-sunken text-ink-muted',
    surface: 'border-line bg-surface-muted',
    text: 'text-ink-muted',
    ring: 'ring-line',
  },
  success: {
    badge: 'border-success/20 bg-success-surface text-success',
    icon: 'bg-success-surface text-success',
    surface: 'border-success/20 bg-success-surface',
    text: 'text-success',
    ring: 'ring-success/15',
  },
  info: {
    badge: 'border-info/20 bg-info-surface text-info',
    icon: 'bg-info-surface text-info',
    surface: 'border-info/20 bg-info-surface',
    text: 'text-info',
    ring: 'ring-info/15',
  },
  warning: {
    badge: 'border-warning/25 bg-warning-surface text-warning',
    icon: 'bg-warning-surface text-warning',
    surface: 'border-warning/25 bg-warning-surface',
    text: 'text-warning',
    ring: 'ring-warning/15',
  },
  danger: {
    badge: 'border-danger/20 bg-danger-surface text-danger',
    icon: 'bg-danger-surface text-danger',
    surface: 'border-danger/20 bg-danger-surface',
    text: 'text-danger',
    ring: 'ring-danger/15',
  },
  chain: {
    badge: 'border-chain/25 bg-chain-surface text-chain',
    icon: 'bg-chain-surface text-chain',
    surface: 'border-chain/25 bg-chain-surface',
    text: 'text-chain',
    ring: 'ring-chain/15',
  },
};
