# Betless MVP

Betless is a Stellar-powered commitment savings MVP for a hackathon/demo setting.

The recommended direction is **Commitment Vault first, recovery-supportive rewards second**. The app helps users protect money from harmful spending impulses by creating a savings commitment, following a top-up plan, claiming fixed demo rewards, and saving a commitment proof linked to a Stellar testnet public address.

## What This MVP Does

- Renders pages with the Next.js App Router.
- Uses `/pages/api` for backend API routes.
- Creates a Betless vault from a guided 3-step form.
- Supports one-time lock and periodic top-up modes.
- Validates Stellar public addresses without asking for private keys.
- Generates only the top-ups needed to reach the selected target.
- Validates that a periodic plan can reach the target within the selected duration.
- Unlocks fixed milestone rewards after completed progress actions.
- Generates demo-only voucher codes.
- Saves a user-facing commitment proof reference.
- Includes a health endpoint.

## What This MVP Does Not Do

- No real money custody.
- No GCash integration.
- No real voucher supplier integration.
- No real yield.
- No auto-debit.
- No KYC.
- No auth system.
- No medical or recovery treatment claims.
- No random rewards, prize pools, tickets, or gambling mechanics.

## Tech Stack

- Next.js
- App Router for page rendering
- Pages Router API routes under `/pages/api`
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Stellar SDK

## Main User Flow

1. Open the landing page.
2. Click **Create a Commitment Vault**.
3. Use the one-click demo Stellar public address or paste a valid public key.
4. Choose one-time lock or periodic top-up.
5. Set the target, duration, top-up, reward, and reason.
6. Create the vault.
7. Follow the next-step card on the vault detail page.
8. Mark the top-up as complete if using periodic mode.
9. Claim the fixed milestone reward.
10. Save the commitment proof.
11. End with a complete demo state.

## Important Product Notes

The proof step is a demo commitment proof, not custody and not a guarantee of funds. The app validates a public Stellar address and saves a proof reference. If testnet account lookup is unavailable, the workflow still completes because the MVP should not block the user on a network dependency.

Real custody, voucher redemption, GCash, yield, and partner settlement belong in a later phase with licensed financial and voucher partners.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Set `DATABASE_URL` in `.env` before running Prisma commands.

## QA Commands

```bash
npm run typecheck
npm run verify:mvp
NEXT_TELEMETRY_DISABLED=1 npm run build:next
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
- `docs/demo-script.md`
- `docs/implementation-checklist.md`
- `docs/engineering-loop-report.md`
- `docs/qa-report.md`
- `docs/end-to-end-audit.md`
