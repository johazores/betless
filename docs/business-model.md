# Betless Business Model

## Product

Betless is a commitment savings product. A user locks a peso deposit for a fixed period and earns points every month for keeping the commitment. Points are redeemed for real-world rewards. The full deposit is returned automatically at the end of the lock period.

## Rules

- **Minimum deposit:** ₱10,000.
- **Lock period:** 12-month increments only (12, 24, 36, 48, 60 months).
- **Rewards:** ~4% of the deposit per year, credited monthly as points. 1 point = ₱1. Points begin only after the first full month of the lock period.
- **Early withdrawal:** allowed any time. Flat ₱500 fee for vaults up to ₱50,000; 1% of the principal above that. The fee is displayed before confirmation. Points already earned are preserved.
- **Maturity:** 100% of the principal is returned automatically, the vault closes, and the points balance is preserved.

All rule constants live in `lib/vault-rules.ts`.

## Backend Assumptions

User funds are held and invested through licensed custodial partners. Investment yields exceed the rewards distributed to users; the margin funds the program. None of this is surfaced in the UI — users only see that they earn points for maintaining their commitment.

## Implementation Notes

- **Accrual:** lazy and idempotent. `VaultService.syncVaults` runs before user-facing reads, inserting due monthly rewards (unique on `(vaultId, monthIndex)`) and settling matured vaults. No scheduler is required for the in-app experience.
- **Auth:** Clerk accounts are required for all vault features; the landing page is public.
- **Money movement:** deposits and payouts are recorded in the app ledger only. Integration with a payment rail / custodial partner API is the main gap before production (see README).
