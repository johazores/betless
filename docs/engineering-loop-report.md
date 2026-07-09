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
