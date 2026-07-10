# Engineering Loop Report

## Current Build Direction

Betless is now structured as a **Commitment Vault** MVP:

- App Router is used for rendered pages under `/app`.
- Pages Router is used only for backend API routes under `/pages/api`.
- Business logic is isolated in `/services`.
- UI components stay focused on presentation.
- Prisma/PostgreSQL remain the database layer.
- Stellar SDK is used for public-key validation and testnet proof status.
- Voucher codes remain demo-only and clearly labeled.

## Loop 9 — Code Structure Polish

### Completed

- Added `lib/api-client.ts` to centralize frontend API request handling.
- Added `lib/status-labels.ts` to avoid repeated enum label formatting inside components.
- Tightened create-vault API validation:
  - invalid vault modes now fail instead of silently defaulting;
  - invalid top-up frequencies now fail;
  - reward preference must match approved demo reward options;
  - reason is capped at 280 characters;
  - top-up amount cannot exceed the savings target.
- Improved top-up completion behavior:
  - current saved amount is capped at the target amount;
  - additional top-ups are blocked once the target is reached;
  - the next top-up disappears once the target is reached.
- Fixed the `lint` script, which was invalid for this Next.js version.
- Added `verify:mvp` script to check required MVP files and scan UI files for unsafe/banned wording.
- Added `check` script for the practical sandbox QA sequence:
  - typecheck;
  - MVP structure verification;
  - Next production build without Prisma generation.

### Current Commands

```bash
npm run typecheck
npm run verify:mvp
NEXT_TELEMETRY_DISABLED=1 npm run build:next
npm run check
```

### Production Build Note

`npm run build` intentionally remains:

```bash
prisma generate && next build
```

This is correct for normal development and deployment because Prisma Client should be generated before the app build.

Inside this sandbox, `prisma generate` fails because the environment cannot resolve Prisma engine downloads from `binaries.prisma.sh`. This is an environment/network limitation, not an app code failure. The app-level build still passes with `npm run build:next` after TypeScript and MVP verification.

## Current MVP Status

The app now has:

- working landing page structure;
- working create vault form path;
- working vault detail UI path;
- working top-up completion API path;
- working reward claim API path;
- working mock voucher generation;
- working Stellar proof endpoint with graceful failure;
- health endpoint;
- project plan;
- implementation checklist;
- recommendation and pitch document;
- demo script;
- README;
- MVP structure verification script.

## Remaining Production Considerations

These are intentionally not built in the MVP:

- real payment custody;
- GCash integration;
- real voucher provider integration;
- KYC/auth;
- regulated fund lock product;
- admin dashboard;
- medical or clinical flows.

Before a real pilot, Betless needs legal review, licensed financial partners for real money movement, and voucher supplier agreements.

## Loop 10 — Structural Resilience and QA Hardening

### Completed

- Added `lib/domain.ts` for shared local enum-style domain constants and view-safe types.
- Removed dependency on generated Prisma enum/type exports from app, component, service, validator, and seed code.
- Kept Prisma as the runtime database client, but made Prisma Client loading lazy in `lib/prisma.ts` so TypeScript and Next build checks can run in restricted environments where Prisma engines cannot be downloaded.
- Added `lib/api-methods.ts` to centralize HTTP method validation and set proper `Allow` headers.
- Updated demo config to reuse shared domain constants instead of duplicating mode/frequency values.
- Expanded `scripts/verify-mvp.mjs` so it now checks:
  - required MVP files;
  - unsafe UI wording;
  - App Router page rendering with no Pages Router render pages;
  - Pages Router API routes with no App Router API routes;
  - required Prisma model blocks;
  - required QA scripts.

### QA Commands Run

```bash
npm run typecheck
npm run verify:mvp
NEXT_TELEMETRY_DISABLED=1 npm run build:next
npm run check
```

### Result

All commands passed.

### Important Production Note

`npm run build` still intentionally runs `prisma generate && next build`. That remains the correct production command because the real Prisma Client should be generated before deploying API routes that use the database.

The sandbox limitation is only the Prisma engine download from `binaries.prisma.sh`. The app code, TypeScript checks, MVP verifier, and Next production build pass after this loop.

## Loop 11 — UX Stepper and Non-Technical Demo Fixes

### Problems Found

- The create vault form was functional but hard to follow because all fields were shown at once.
- Non-technical demo users could get blocked by the Stellar public address field.
- The UI needed another contrast pass to avoid white-background/white-text issues, especially around active states and browser autofill.

### Completed

- Converted `components/vault/create-vault-form.tsx` into a guided three-step flow:
  1. Wallet
  2. Savings plan
  3. Reward & reason
- Added `components/ui/stepper.tsx` with clear active, completed, and upcoming step states.
- Added a one-click demo Stellar testnet public address so users do not need to understand wallet setup during the demo.
- Added plain-language helper copy explaining that a public key is safe to share and secret keys/private keys should never be entered.
- Added client-side step validation before allowing users to continue to the next step.
- Added a final review panel before vault creation.
- Updated `app/create-vault/page.tsx` to explain the guided setup and non-technical demo path.
- Added global input/autofill styles in `app/globals.css` to force dark text on white inputs and prevent browser autofill contrast issues.
- Ran a code scan for white-background/white-text patterns in app and component files.

### QA Commands Run

```bash
npm run typecheck
npm run verify:mvp
NEXT_TELEMETRY_DISABLED=1 npm run build:next
```

### Result

All commands passed.

## Loop 12 — Simple UI Reset and Contrast Fix

### Problems Found

- Dark card styling was still being applied through reusable cards that already had a white background class.
- Because Tailwind utility order is not controlled by the order of strings in `className`, the white card background could override a dark card background while dark-card text remained white.
- This created the exact bad UX shown in the screenshots: white or very light text on a white card.
- The visual style was also too decorative for a fast workshop demo.

### Completed

- Reset the global app background to a plain light gray instead of layered gradients.
- Simplified the base `Card` component to a readable white card with slate text, slate border, and light shadow.
- Removed dark-card layouts from the landing page, create vault page, and vault detail summary.
- Rebuilt the vault summary card as a simple readable white card with dark text and light gray metric boxes.
- Simplified the landing page demo card and final CTA section.
- Simplified the create vault side panel so all copy uses dark text on white or amber-tinted backgrounds.
- Updated the stepper to use light active states instead of dark active states.
- Updated progress bars to use a simple amber fill on a slate track.
- Updated empty and loading states to plain white cards.
- Kept dark buttons only where they are directly applied to actual buttons or brand marks, not inside cards with conflicting backgrounds.

### QA Commands Run

```bash
npm run typecheck
npm run verify:mvp
NEXT_TELEMETRY_DISABLED=1 npm run build:next
npm run check
```

### Result

All commands passed.

### UI Rule Going Forward

For this MVP, avoid passing dark background classes into the shared `Card` component. Use simple white cards for content and reserve dark backgrounds for buttons, small badges, or brand marks only.

## Loop 13 — End-to-End Product and Engineering Audit

### Root cause found

The confusing commitment proof screen was caused by incomplete workflow semantics, not only bad copy. The service treated optional Stellar testnet account lookup failure as a user-facing proof failure, which exposed implementation details and gave the user no clear next step.

### Completed fixes

- Added `docs/end-to-end-audit.md` with a full product, frontend, backend, API, business logic, database, security, and architecture audit.
- Added `lib/planning.ts` for shared savings-plan rules.
- Added target reachability validation for periodic top-up plans.
- Changed one-time lock mode so the committed amount must match the target amount.
- Generated only the top-ups needed to reach the target instead of creating unnecessary future dead-end top-ups.
- Aligned reward milestones to the actual reachable demo actions.
- Added `VaultNextStepCard` so every vault detail state has a clear next action.
- Changed the proof workflow from "testnet proof unavailable" to a product-facing commitment proof that completes when the public key is valid.
- Disabled duplicate proof creation after a proof is saved.
- Added database indexes for common status and vault relation lookups.
- Updated README and copy to explain the complete demo path without exposing internal implementation details.

### QA completed

```bash
npm run typecheck
npm run verify:mvp
NEXT_TELEMETRY_DISABLED=1 npm run build:next
npm run check
```

All checks passed.

## Loop 14 — Clerk Accounts, Dashboard, Receipts, and Proof History

### Root Issue

The prior MVP created vaults anonymously. That made the Stellar proof and receipt flow incomplete because users had no account, no dashboard, no history, and no way to return later to view previous vaults or proofs.

### Fixes Completed

- Added Clerk sign-in and sign-up screens.
- Added account navigation and user menu.
- Added account-required states for product flows.
- Added bearer-token API authentication using Clerk session tokens.
- Added `AppUser` to map Clerk users to Betless records.
- Added vault ownership.
- Added `ProofReceipt` records.
- Added dashboard with vault and receipt history.
- Added receipt detail page with proof reference, transaction hash fields, ledger, memo, explorer link, and print/export support.
- Updated Stellar proof service so receipt creation happens during vault creation.
- Added optional live Stellar testnet proof transaction when `STELLAR_PROOF_SOURCE_SECRET` is configured.
- Kept safe demo receipt behavior when the proof signer is not configured.

### QA

Passed:

```bash
npm run typecheck
npm run verify:mvp
NEXT_PUBLIC_CLERK_KEYLESS_DISABLED=true NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_replace_me CLERK_SECRET_KEY=sk_test_replace_me NEXT_TELEMETRY_DISABLED=1 npm run build:next
```

`npm run check` now runs the deterministic code checks only: TypeScript and MVP verification. The Next production build was run separately because the sandbox has previously been unstable when chaining Next build after TypeScript in one command.

## Loop 15 — Clerk Migration Repair

### Issue found
Existing local databases created before Clerk can contain anonymous `Vault` rows. Prisma cannot add the required `Vault.appUserId` column while those rows have no owner.

### Root cause
The app architecture moved from anonymous demo vaults to account-owned vaults. The database needs a backfill step before enforcing the required ownership relationship.

### Fix added
- Added `scripts/sql/repair-legacy-vault-owners.sql`.
- Added `npm run db:repair:legacy-vaults`.
- Added `docs/database-migration-repair.md`.

### Correct local upgrade path
```bash
npm run db:repair:legacy-vaults
npm run prisma:migrate
npm run prisma:generate
```

### Notes
The repair assigns old anonymous demo vaults to a `legacy-demo-user`. New vaults are still required to belong to the signed-in Clerk user.

## Loop 15 — Fresh Database Reset Baseline

### Root cause

The development database had drift because earlier migrations did not include the final Clerk ownership and `ProofReceipt` schema. After reset, Prisma replayed only the old migration history, so the generated Prisma Client expected `ProofReceipt` but the database did not contain that table.

### Fix

- Added a fresh baseline migration under `prisma/migrations/20260710000000_fresh_schema/migration.sql`.
- The baseline includes `AppUser`, `Vault`, `TopUp`, `RewardClaim`, and `ProofReceipt`.
- Added `prisma/migrations/migration_lock.toml`.
- Added `npm run db:reset:force` for full development resets.
- Removed the legacy repair script from `package.json` to avoid confusion when the goal is to reset everything.
- Added `docs/database-reset-from-scratch.md`.
- Updated README setup/reset instructions.
- Expanded `npm run verify:mvp` to confirm the fresh migration includes all required tables.

### Status

Fresh reset is now the intended path for disposable local/Neon demo data.
