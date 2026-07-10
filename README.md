# Betless MVP

Betless is a Stellar-powered commitment savings MVP for a hackathon/demo setting.

The recommended direction is **Commitment Vault first, recovery-supportive rewards second**. The app helps users protect money from harmful spending impulses by creating a savings commitment, following a top-up plan, claiming fixed demo rewards, and saving a commitment proof receipt linked to a Stellar testnet public address.

## What This Version Adds

This loop completes the missing account and proof-history workflow:

- Clerk sign-up and login pages.
- Clerk account UI in the header.
- Account-required states for vault creation, dashboard, vault details, and receipts.
- Protected Pages API routes using Clerk session tokens.
- Local `AppUser` mapping from Clerk user ID.
- Vault ownership by signed-in user.
- Dashboard showing saved vaults and receipt history.
- Receipt detail page with print/export support.
- Stored `ProofReceipt` records tied to both user and vault.
- Optional live Stellar testnet transaction proof when a server-side testnet signer is configured.
- Safe demo receipt fallback when no live signer is configured.

## What This MVP Does

- Renders pages with the Next.js App Router.
- Uses `/pages/api` for backend API routes.
- Uses Clerk for authentication.
- Creates a Betless vault from a guided 3-step form.
- Supports one-time lock and periodic top-up modes.
- Validates Stellar public addresses without asking for private keys.
- Generates only the top-ups needed to reach the selected target.
- Validates that a periodic plan can reach the target within the selected duration.
- Unlocks fixed milestone rewards after completed progress actions.
- Generates demo-only voucher codes.
- Saves an account-linked commitment proof receipt.
- Includes a dashboard and receipt history.
- Includes a health endpoint.

## What This MVP Does Not Do

- No real money custody.
- No GCash integration.
- No real voucher supplier integration.
- No real yield.
- No auto-debit.
- No KYC.
- No medical or recovery treatment claims.
- No random rewards, prize pools, tickets, or gambling mechanics.

## Tech Stack

- Next.js
- App Router for page rendering
- Pages Router API routes under `/pages/api`
- TypeScript
- Tailwind CSS
- Clerk
- Prisma
- PostgreSQL
- Stellar SDK

## Main User Flow

1. User signs up or logs in.
2. User opens the dashboard or creates a vault.
3. User uses the one-click demo Stellar public address or pastes a valid public key.
4. User chooses one-time lock or periodic top-up.
5. User sets the target, duration, top-up, reward, and reason.
6. System creates the vault under the signed-in user.
7. System creates a commitment proof receipt.
8. User lands on the vault detail page.
9. User follows the next-step card.
10. User can mark top-ups complete and claim fixed milestone rewards.
11. User can view all vaults and receipts from `/dashboard`.
12. User can open `/receipts/[id]` to review, print, export, or verify proof details.

## Stellar Proof Modes

### Demo Receipt Mode

If `STELLAR_PROOF_SOURCE_SECRET` is empty, the app creates a complete demo receipt. This is intentional for the hackathon MVP. It gives the user a saved confirmation without pretending a live transaction happened.

### Network Receipt Mode

If `STELLAR_PROOF_SOURCE_SECRET` contains a funded Stellar testnet source account secret, the proof service attempts a tiny Stellar testnet transaction with a memo. When successful, the receipt stores:

- transaction hash
- ledger number when available
- memo
- proof reference
- Stellar Expert explorer link

No user private key is ever requested.

## Environment

```bash
cp .env.example .env
```

Required:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/betless?schema=public"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_replace_me"
CLERK_SECRET_KEY="sk_test_replace_me"
STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
```

Optional:

```bash
STELLAR_PROOF_SOURCE_SECRET="S...testnet-source-secret"
```

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:migrate
npm run prisma:generate
npm run dev
```

`npm run prisma:migrate` applies the current baseline migration and runs the configured seed command in development.

## Fresh Database Reset

If your Neon or local development database has drift from older Betless builds, reset it completely:

```bash
npm run db:reset:force
npm run prisma:generate
npm run dev
```

This deletes development data and recreates the full current schema, including `AppUser`, `Vault`, `TopUp`, `RewardClaim`, and `ProofReceipt`.

See `docs/database-reset-from-scratch.md` for details.

## QA Commands

```bash
npm run typecheck
npm run verify:mvp
NEXT_PUBLIC_CLERK_KEYLESS_DISABLED=true NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_replace_me CLERK_SECRET_KEY=sk_test_replace_me NEXT_TELEMETRY_DISABLED=1 npm run build:next
npm run check
```

The normal production build script remains:

```bash
npm run build
```

That runs `prisma generate && next build`.

## Documentation

- `docs/project-plan.md`
- `docs/recommended-concept-and-pitch.md`
- `docs/auth-and-stellar-workflow.md`
- `docs/demo-script.md`
- `docs/implementation-checklist.md`
- `docs/engineering-loop-report.md`
- `docs/qa-report.md`
- `docs/end-to-end-audit.md`
- `docs/database-reset-from-scratch.md`

## Resetting older local databases

Older Betless builds may have missing receipt tables or anonymous vault rows. For the current demo app, the cleanest fix is a full development reset:

```bash
npm run db:reset:force
```

This is safe for disposable demo data only. It recreates the schema from the fresh baseline migration and runs the seed.
