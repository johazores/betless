# Betless Project Plan

## Vision

Betless is a Stellar-powered commitment savings and milestone rewards MVP. It helps users protect money from harmful spending impulses by creating a locked, goal-based savings commitment and giving small fixed food, transport, grocery, or eGift-style rewards for consistent progress.

## Recommended Product Direction

Betless should use a hybrid strategy:

1. **Rewarded savings** as the main product category.
2. **Recovery-supportive rewards** as the social impact angle.

This direction is stronger than a pure recovery app because the MVP can verify positive savings actions instead of trying to prove private behavior. It is also safer than any chance-based or game-like product because rewards are fixed, predictable, and tied to progress milestones.

Detailed rationale is documented in [`docs/recommended-concept-and-pitch.md`](./recommended-concept-and-pitch.md).

## Positioning

Betless is a commitment savings and reward layer. It is not a medical product, not a chance-based product, and not a real-money custody product in this MVP.

Approved positioning language:

- commitment savings
- money protection
- goal-based savings
- impulse-control savings
- locked savings plan
- milestone rewards
- partner-powered rewards
- Stellar proof layer

Avoided product patterns:

- chance-based reward mechanics
- ticket mechanics
- prize pools
- gameplay loops
- treatment or diagnosis claims
- guaranteed returns
- direct fund custody in the MVP

## MVP Scope

Included:

1. Landing page
2. Create Betless vault page
3. Vault detail page
4. Periodic top-up schedule
5. Milestone reward claim
6. Mock voucher generation
7. Stellar testnet proof section
8. Health endpoint
9. README/demo instructions
10. Master implementation checklist
11. Recommended concept and pitch document

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
- chance mechanics
- ticket mechanics
- prize mechanics

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
- `reward-service.ts`: milestone reward creation, eligibility, claim, duplicate prevention.
- `voucher-service.ts`: demo-only mock voucher code generation.
- `stellar-proof-service.ts`: public key validation and graceful testnet proof status.
- `config-service.ts`: reward and Stellar configuration.

## Demo Flow

1. User opens landing page.
2. User clicks Create a Commitment Vault.
3. User enters Stellar testnet public address.
4. User chooses One-Time Lock or Periodic Top-Up.
5. User sets target amount, top-up amount, duration, reward preference, and reason.
6. App creates the vault.
7. App shows vault detail page.
8. User marks one top-up completed.
9. App updates current saved amount.
10. User claims a milestone reward.
11. App generates a mock voucher code.
12. App shows Stellar proof section.

## Production Notes

In production, deposits, custody, payment rails, and voucher fulfillment should be handled by licensed financial and voucher partners. Rewards can be sponsor-funded, partner-funded, or funded through approved financial partner programs. Betless should not promise yield or operate real fund custody without legal review and licensed partners.
