# Betless Project Plan

## Vision

Betless is a 1-day MVP for a Stellar-powered commitment savings and recovery rewards app. It helps people protect money from impulse spending by creating a locked, goal-based savings commitment and giving small fixed food or transport rewards for consistent progress.

## Positioning

Betless is a commitment savings and reward layer. It is not a gambling product, not a medical product, and not a real-money custody product in this MVP.

Approved positioning language:

- commitment savings
- recovery rewards
- money protection
- goal-based savings
- impulse-control savings
- locked savings plan
- partner-powered rewards
- Stellar proof layer

Avoided language:

- gambling app
- non-gambling gambling
- betting
- arcade
- tickets
- casino
- random rewards
- rehab treatment
- medical treatment
- guaranteed yield
- investment product

## MVP Scope

Included:

1. Landing page
2. Create Betless vault page
3. Vault detail page
4. Periodic top-up schedule
5. Weekly reward claim
6. Mock voucher generation
7. Stellar testnet proof section
8. Health endpoint
9. README/demo instructions
10. Master implementation checklist

Excluded:

- real GCash integration
- real voucher API
- real money custody
- real yield generation
- auto-debit
- KYC
- auth system
- admin dashboard
- email/SMS
- QR code
- charts
- medical questionnaire
- gambling mechanics
- ticket mechanics
- random reward mechanics

## Architecture

Page rendering uses Next.js App Router under `/app`.

Backend routes use Pages Router API routes under `/pages/api`.

Business logic is isolated in `/services`. Components are focused on UI. Prisma database access is kept inside services and server utilities.

## Tech Stack

- Next.js
- App Router for rendered pages
- Pages API routes for backend endpoints
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- Stellar SDK

## Main Routes

Rendered pages:

- `/`
- `/create-vault`
- `/vaults/[id]`

API routes:

- `POST /api/vaults`
- `GET /api/vaults/[id]`
- `POST /api/vaults/[id]/mark-top-up`
- `POST /api/vaults/[id]/claim-reward`
- `POST /api/vaults/[id]/create-stellar-proof`
- `GET /api/health`

## Data Model

Prisma models:

- `AppConfig`
- `Vault`
- `TopUp`
- `RewardClaim`

Enums:

- `VaultMode`
- `TopUpFrequency`
- `VaultStatus`
- `StellarStatus`
- `TopUpStatus`
- `RewardStatus`

## Service Layer

- `vault-service.ts`: vault creation, unlock date, reward value, schedule generation coordination, detail views.
- `top-up-service.ts`: schedule creation, top-up completion, duplicate prevention, progress update.
- `reward-service.ts`: weekly reward creation, eligibility, claim, duplicate prevention.
- `voucher-service.ts`: demo-only mock voucher code generation.
- `stellar-proof-service.ts`: public key validation and graceful testnet proof status.
- `config-service.ts`: reward and Stellar configuration.

## Demo Flow

1. User opens landing page.
2. User clicks Create a Betless Vault.
3. User enters Stellar testnet public address.
4. User chooses One-Time Lock or Periodic Top-Up.
5. User sets target amount, top-up amount, duration, reward preference, and reason.
6. App creates the vault.
7. App shows vault detail page.
8. User marks one top-up completed.
9. User claims weekly reward.
10. App generates a mock voucher code.
11. App shows Stellar proof section.

## Production Notes

In production, deposits, yield, and voucher fulfillment can be handled by licensed payment, savings, and voucher partners. Rewards can be funded through partner yield, sponsor subsidy, or platform incentives. This MVP does not handle real funds, real vouchers, or real yield.
