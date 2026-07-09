# Betless

Betless is a Stellar-powered commitment savings and milestone rewards MVP.

It uses App Router for page rendering and Pages Router API routes under `/pages/api` for backend endpoints.

## Recommended Direction

Betless should be presented as a **Commitment Vault** product:

- Main category: rewarded savings
- Impact angle: recovery-supportive money protection
- Reward design: fixed milestone rewards
- MVP status: demo-only vouchers and Stellar testnet proof

Read the full proposal and pitch draft here:

```txt
docs/recommended-concept-and-pitch.md
```

## What this MVP does

- Creates a commitment savings vault
- Stores vault, top-up, and reward records with Prisma/PostgreSQL
- Shows a polished vault detail page
- Lets a user mark the next top-up as completed
- Unlocks a fixed milestone reward after progress
- Generates a demo-only mock voucher code
- Validates Stellar public keys with Stellar SDK
- Attempts a graceful Stellar testnet proof status

## What this MVP does not do

- No real GCash integration
- No real voucher supplier
- No real money custody
- No real yield
- No auth/KYC
- No chance mechanics
- No ticket or prize mechanics
- No treatment or diagnosis claims

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Open:

```txt
http://localhost:3000
```


## Quality checks

Use this practical check loop while polishing the MVP:

```bash
npm run typecheck
npm run verify:mvp
NEXT_TELEMETRY_DISABLED=1 npm run build:next
npm run check
```

`npm run build` still runs `prisma generate && next build`, which is correct for normal local development and deployment. If Prisma engine downloads are blocked by the environment, run the check loop above to verify the app code while keeping Prisma generation in the production build script.

## Engineering loop report

```txt
docs/engineering-loop-report.md
```

## Demo flow

1. Open the landing page.
2. Click **Create a Commitment Vault**.
3. Enter a Stellar testnet public address.
4. Use the demo defaults: ₱10,000 target, ₱2,000 monthly top-up, 12 months.
5. Create the vault.
6. On the vault detail page, mark the next top-up completed.
7. Claim the available milestone reward.
8. Create Stellar proof.

## Testnet wallet note

Only a Stellar public key is required. Never paste a private key or secret key into the app.

## Health check

```txt
GET /api/health
```

## Latest Engineering Loop

Loop 10 added structural hardening:

- shared domain constants/types in `lib/domain.ts`;
- lazy Prisma Client loading for restricted sandbox checks;
- centralized API method validation in `lib/api-methods.ts`;
- expanded MVP verification for route architecture, schema presence, QA scripts, and unsafe UI wording;
- new `docs/qa-report.md` file.

Use this command for the current practical QA loop:

```bash
npm run check
```

Use this command for normal production/deployment environments:

```bash
npm run build
```
