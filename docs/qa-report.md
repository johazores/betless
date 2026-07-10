# QA Report

## Current MVP Status

Betless is ready for demo review as a Stellar testnet Commitment Vault MVP.

The app follows the recommended hybrid direction:

- Commitment savings first.
- Recovery-supportive impact narrative second.
- No chance mechanics.
- No real money custody.
- No real voucher fulfillment.
- No medical or treatment claims.
- Stellar is used as a testnet proof layer.

## Verified Architecture

- App Router renders product pages under `/app`.
- Pages Router is used only for API routes under `/pages/api`.
- API logic stays in API route handlers.
- Business logic stays in `/services`.
- Shared domain constants live in `lib/domain.ts`.
- Prisma remains the database layer.
- Stellar logic stays in `services/stellar-proof-service.ts` and `lib/stellar.ts`.

## UX Fixes Completed

- Create vault page now uses a three-step guided setup instead of one long form.
- Stepper shows active, completed, and upcoming states clearly.
- Non-technical users can click **Use demo testnet address** instead of manually creating or finding a Stellar public key.
- Public key helper text explains that public keys are safe to share and secret keys/private keys must never be entered.
- The form validates each step before allowing the user to continue.
- The final step includes a review summary before vault creation.
- Inputs, selects, textareas, autofill states, and disabled buttons were checked for contrast.
- A scan for direct white-background/white-text class combinations returned clean.

## Commands Run

```bash
npm run typecheck
npm run verify:mvp
NEXT_TELEMETRY_DISABLED=1 npm run build:next
```

## Results

- TypeScript check: passed.
- MVP file and wording verification: passed.
- Next production build: passed.

## Known Environment Limitation

`npm run build` runs `prisma generate && next build`.

That is correct for production, but this sandbox cannot resolve Prisma engine downloads from `binaries.prisma.sh`, so `prisma generate` can fail here with DNS `EAI_AGAIN`.

For local development or deployment, run the normal command after setting `DATABASE_URL` and allowing Prisma engine download:

```bash
npm install
npx prisma generate
npm run build
```

## Demo Flow Checklist

- [x] Landing page loads.
- [x] Create vault page loads.
- [x] Create vault form uses a clear stepper.
- [x] Demo Stellar public key helper exists.
- [x] Create vault form uses realistic demo defaults.
- [x] API route exists for vault creation.
- [x] Vault detail route exists.
- [x] Top-up completion route exists.
- [x] Reward claim route exists.
- [x] Mock voucher generation exists.
- [x] Stellar proof route exists.
- [x] Health endpoint exists.
- [x] README exists.
- [x] Demo script exists.
- [x] Proposal/pitch document exists.
- [x] Implementation checklist exists.

## Not Included by Design

- Real GCash integration.
- Real voucher API.
- Real money custody.
- Real yield generation.
- Auto-debit.
- KYC.
- Auth system.
- Full admin dashboard.
- Medical questionnaire.
- Gambling, ticket, random reward, or betting mechanics.

## Loop 12 Visual QA Update

The UI was reset to a simpler, safer style after screenshot review showed white text appearing on white cards.

Completed visual fixes:

- Global background changed to plain light gray.
- Shared cards now use solid white backgrounds with dark text.
- Dark card variants were removed from the landing hero, create vault guide, and vault summary.
- Vault summary metrics now use readable gray boxes with dark labels and values.
- Stepper active state now uses a light amber background with dark text.
- Demo cards and disclaimer panels now use light backgrounds with dark text.
- Loading and empty states now use plain white cards.

Verification after the reset:

```bash
npm run typecheck
npm run verify:mvp
NEXT_TELEMETRY_DISABLED=1 npm run build:next
npm run check
```

Result: all passed.

## Loop 13 QA — End-to-End Audit Fixes

### Commands run

```bash
npm run typecheck
npm run verify:mvp
NEXT_TELEMETRY_DISABLED=1 npm run build:next
npm run check
```

### Result

All checks passed.

### Verified behavior

- Create vault remains available through the App Router.
- API routes remain under `/pages/api`.
- Periodic plans cannot be created if the selected top-up amount and duration cannot reach the target.
- One-time lock mode no longer creates a partial commitment with no next action.
- Vault detail page now has a clear next-step card.
- Commitment proof no longer exposes `testnet-proof-unavailable` as a user-facing dead end.
- Demo proof workflow completes with a saved proof reference when the public address is valid.

## Loop 14 QA — Clerk Auth and Stellar Receipt Workflow

Commands run:

```bash
npm run typecheck
npm run verify:mvp
NEXT_PUBLIC_CLERK_KEYLESS_DISABLED=true NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_replace_me CLERK_SECRET_KEY=sk_test_replace_me NEXT_TELEMETRY_DISABLED=1 npm run build:next
```

Results:

- TypeScript passed.
- MVP verifier passed.
- Next production build passed when run directly with Clerk environment placeholders.

Notes:

- Clerk requires real `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` for local runtime.
- Live Stellar network receipts require `STELLAR_PROOF_SOURCE_SECRET` to be set to a funded testnet source account.
- If the Stellar signer is not configured, the app creates a clearly labeled demo receipt instead of blocking the user.


## Loop 15 — Fresh Database Reset Baseline
- [x] Added fresh baseline migration including AppUser, Vault, TopUp, RewardClaim, and ProofReceipt
- [x] Added migration lock file
- [x] Added database reset documentation
- [x] Added db:reset:force command
- [x] Removed legacy repair command from package scripts
- [x] Updated README reset flow
- [x] Updated MVP verifier to check required migration tables
- [ ] Local Neon reset must be run by developer using `npm run db:reset:force`
