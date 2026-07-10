# Betless

Betless is a commitment savings app that helps users protect money, follow a clear savings plan, and earn fixed milestone rewards.

The product is designed for non-technical users. A person can create a vault immediately, connect an account later, and return to review vault history and receipts.

## Current Product Flow

1. Open the landing page.
2. Select **Create Vault**.
3. Create a new wallet or use an existing Stellar public address.
4. Choose a vault type, target amount, lock period, and top-up schedule.
5. Choose a fixed milestone reward.
6. Create the vault.
7. Track progress, complete top-ups, claim rewards, and save a receipt.
8. Connect an account to view the vault later from the dashboard.

## Product Principles

- Start without friction.
- Sign in only when the user wants saved history.
- Never ask for private keys on the server.
- Keep labels short and action-oriented.
- Make every screen show the next action.
- Use fixed rewards only.
- Keep financial custody and reward fulfillment with connected partners.

## Features

- Public landing page.
- Fast Create Vault flow.
- Optional Clerk account connection.
- Guest vault access from the same browser.
- Create new Stellar wallet in-browser.
- Use existing Stellar public address.
- One-time lock and recurring top-up plans.
- Top-up schedule tracking.
- Fixed milestone rewards.
- Voucher code generation.
- Vault receipt creation.
- Dashboard for signed-in users.
- Receipt page with network verification link when available.
- Health endpoint.

## Tech Stack

- Next.js App Router for pages.
- Pages Router API routes under `/pages/api`.
- TypeScript.
- Tailwind CSS.
- Prisma.
- PostgreSQL.
- Clerk.
- Stellar SDK.

## Environment Variables

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_replace_me"
CLERK_SECRET_KEY="sk_test_replace_me"
STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
STELLAR_PROOF_SOURCE_SECRET=""
```

`STELLAR_PROOF_SOURCE_SECRET` is optional. When set to a funded Stellar source account, Betless can attach network transaction details to receipts. Without it, Betless still saves a private vault receipt and keeps the user flow complete.

## Install

```bash
npm install
cp .env.example .env
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Fresh Database Reset

Use this only for a disposable development database:

```bash
npm run db:reset:force
npm run prisma:generate
npm run dev
```

## QA Commands

```bash
npm run typecheck
npm run verify:mvp
NEXT_PUBLIC_CLERK_KEYLESS_DISABLED=true NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_replace_me CLERK_SECRET_KEY=sk_test_replace_me NEXT_TELEMETRY_DISABLED=1 npm run build:next
npm run check
```

## Main Routes

- `/` — landing page
- `/create-vault` — create flow
- `/vaults/[id]` — vault detail
- `/dashboard` — account history
- `/receipts/[id]` — receipt detail
- `/api/health` — health check

## Security Notes

- Secret keys are never sent to Betless servers.
- Guest vault access uses a browser-held access token and server-side hash.
- Signed-in vaults are protected by Clerk session verification.
- Receipts are visible only to the account owner or the browser that created the vault.
