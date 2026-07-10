# Authentication and Stellar Proof Workflow

## Final Product Decision

Betless now uses Clerk for account registration and login. Vaults, receipts, and proof history are associated with the signed-in Clerk user instead of being anonymous demo records.

The workflow is intentionally split into two safe layers:

1. **Account layer** — Clerk handles sign-up, login, session management, and user profile UI.
2. **Betless data layer** — Betless stores an internal `AppUser` row that maps to the Clerk user ID, then attaches vaults and receipts to that user.

## Complete User Journey

1. User signs up or logs in with Clerk.
2. User opens `/create-vault`.
3. User creates a commitment vault using the guided stepper.
4. The API verifies the Clerk session token before saving the vault.
5. The system creates the vault under the matching `AppUser`.
6. The system immediately creates a commitment proof receipt for the vault.
7. The user is redirected to `/vaults/[id]`.
8. The vault page shows progress, next step, rewards, and receipt status.
9. The user can open `/dashboard` to see all saved vaults and proof receipts.
10. The user can open `/receipts/[id]` to view, print, export, or verify a receipt.

## Why Token-Based API Auth Instead of Clerk Middleware

The app uses Clerk session tokens on client API requests and verifies those tokens in Pages API routes with `@clerk/backend` `verifyToken`.

This keeps the App Router page rendering and Pages API architecture stable while still enforcing backend authorization. It also avoids relying on route middleware for the MVP, which caused unstable sandbox builds with the installed Clerk/Next version combination.

Protected behavior is handled in two places:

- **Frontend guard:** pages show an account-required state if the user is not signed in.
- **Backend enforcement:** every vault and receipt API verifies the Clerk bearer token and checks ownership before returning or mutating data.

## Database Ownership Model

Added models and relationships:

- `AppUser`
  - stores `clerkUserId`
  - owns vaults
  - owns proof receipts

- `Vault`
  - now includes `appUserId`
  - every vault belongs to one `AppUser`

- `ProofReceipt`
  - stores receipt status
  - stores proof reference
  - stores transaction hash when available
  - stores explorer URL when a live Stellar transaction exists
  - belongs to both an `AppUser` and a `Vault`

## Stellar Proof Behavior

### Demo Mode

If `STELLAR_PROOF_SOURCE_SECRET` is not configured, Betless creates a complete **demo receipt**.

The user still receives:

- receipt ID
- proof reference
- vault link
- public Stellar address
- created date
- print/export option
- clear explanation that no live testnet transaction was submitted

This avoids a dead end and keeps the user journey complete.

### Network Mode

If `STELLAR_PROOF_SOURCE_SECRET` is configured with a funded Stellar testnet source account, Betless attempts a real Stellar testnet proof transaction.

When successful, the receipt includes:

- transaction hash
- ledger number when returned by Horizon
- memo
- proof reference
- direct Stellar Expert explorer link

The app never asks the user for a secret key or seed phrase. The optional proof signer is server-side only.

## Production Behavior

For production, Betless should use:

- Clerk for user accounts
- a licensed wallet/payment partner for real custody
- a funded server-side proof signer or partner-controlled signing flow
- Stellar network receipts for auditable proof
- voucher supplier APIs for fulfillment
- legal review before real money movement

## What Was Removed or Avoided

- Anonymous vault ownership
- User-facing internal proof failure references
- Dead-end proof screens
- Any need for users to paste private keys
- Any claim that demo receipts are real on-chain transactions

## Current Auth and Proof Files

- `app/sign-in/[[...sign-in]]/page.tsx`
- `app/sign-up/[[...sign-up]]/page.tsx`
- `app/dashboard/page.tsx`
- `app/dashboard/dashboard-client.tsx`
- `app/receipts/[id]/page.tsx`
- `app/receipts/[id]/receipt-client.tsx`
- `components/layout/auth-nav.tsx`
- `components/layout/clerk-provider-client.tsx`
- `lib/auth.ts`
- `services/user-service.ts`
- `services/receipt-service.ts`
- `services/stellar-proof-service.ts`
- `pages/api/receipts/index.ts`
- `pages/api/receipts/[id].ts`
