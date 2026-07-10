# Betless

Betless is a commitment savings app. Users lock a deposit for a fixed period, earn points every month, redeem those points for real-world rewards, and get their full deposit back at maturity.

## Product Flow

1. Open the landing page.
2. Sign up (required — vaults and points are tied to your account).
3. Create a commitment savings vault: choose a deposit and lock period.
4. After the first full month, points start accumulating monthly.
5. Redeem points for real-world rewards (groceries, travel, apparel, gadgets, partner merchants).
6. When the lock period ends, the full deposit is returned automatically and the vault closes. Points are preserved.
7. Early withdrawal is available at any time for a fee, shown clearly before confirmation.

## Business Rules

| Rule | Value |
|------|-------|
| Minimum deposit | ₱10,000 |
| Lock period | 12-month increments (12, 24, 36, 48, 60) |
| Rewards rate | ~4% of the deposit per year, credited as points monthly |
| Points value | 1 point = ₱1 |
| Points start | After the first full month of the lock period |
| Early withdrawal fee | Flat ₱500 for vaults up to ₱50,000; 1% of the principal above that |
| Maturity | 100% of the principal returned automatically; vault closes; points preserved |

All of these constants live in `lib/vault-rules.ts` and are shared by the API, services, and UI so previews always match what the server applies.

Behind the scenes, deposits are held and invested through licensed custodial partners; users only see the points they earn for maintaining their commitment.

## How Points Accrue

There is no cron job. Monthly rewards are accrued lazily: whenever a user's data is read, `VaultService.syncVaults` inserts any monthly point rewards that have become due (idempotent via a unique `(vaultId, monthIndex)` constraint) and settles any vault whose lock period has ended.

## Tech Stack

- Next.js App Router for pages, Pages Router for API routes under `pages/api`.
- TypeScript, Tailwind CSS.
- Prisma + PostgreSQL.
- Clerk for authentication (required for all vault features).

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page (public) |
| `/sign-in`, `/sign-up` | Clerk auth |
| `/create-vault` | Create a vault |
| `/dashboard` | Locked balance, points, vault list, points activity |
| `/vaults/[id]` | Vault detail and early withdrawal |
| `/rewards` | Rewards catalog, redemption, history |

API: `GET/POST /api/vaults`, `GET /api/vaults/[id]`, `POST /api/vaults/[id]/withdraw`, `GET /api/summary`, `GET /api/points`, `POST /api/rewards/redeem`, `GET /api/health`.

## Environment Variables

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_replace_me"
CLERK_SECRET_KEY="sk_test_replace_me"
```

## Install

```bash
npm install
cp .env.example .env
npm run db:reset:force   # applies the fresh commitment-savings schema
npm run dev
```

The database schema was rebuilt for the commitment savings model, so existing development databases must be reset with `npm run db:reset:force`.

## QA Commands

```bash
npm run typecheck
npm run verify:mvp
npm run check
```
