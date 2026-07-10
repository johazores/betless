# Implementation Checklist

## Loop 1 — Foundation
- [x] Project setup complete
- [x] Tailwind configured
- [x] Prisma configured
- [x] Base layout created
- [x] Reusable UI components created
- [x] Landing page complete
- [x] Build passes

## Loop 2 — Vault Creation
- [x] Vault model created
- [x] TopUp model created
- [x] RewardClaim model created
- [x] POST /api/vaults created
- [x] Create vault form created
- [x] Vault creation works in code path
- [x] Build passes

## Loop 3 — Vault Detail
- [x] GET /api/vaults/[id] created
- [x] Vault detail page created
- [x] Progress card created
- [x] Top-up schedule created
- [x] Reward timeline created
- [x] Stellar proof card created
- [x] Build passes

## Loop 4 — Top-Up Completion
- [x] POST /api/vaults/[id]/mark-top-up created
- [x] Top-up can be marked completed
- [x] Current amount updates
- [x] Duplicate completion prevented
- [x] Build passes

## Loop 5 — Reward Claim
- [x] POST /api/vaults/[id]/claim-reward created
- [x] Reward eligibility works
- [x] Voucher code generated
- [x] Duplicate reward claim prevented
- [x] Reward UI updates
- [x] Build passes

## Loop 6 — Stellar Proof
- [x] Stellar public key validation added
- [x] Stellar testnet config added
- [x] create-stellar-proof endpoint added
- [x] commitment proof saved
- [x] Failure handled gracefully
- [x] No private keys exposed
- [x] Build passes

## Loop 7 — Polish
- [x] Mobile responsive pass complete
- [x] Tablet responsive pass complete
- [x] Desktop responsive pass complete
- [x] Loading states complete
- [x] Error states complete
- [x] Empty states complete
- [x] README complete
- [x] Demo script complete
- [x] Final build passes

## Current QA Status

- `npx tsc --noEmit` passes.
- `NEXT_TELEMETRY_DISABLED=1 npx next build` passes.
- `npm run build` still cannot complete inside this sandbox because Prisma engine downloads from `binaries.prisma.sh` fail with DNS `EAI_AGAIN`. The project still keeps `prisma generate && next build` in the production build script so a normal local/dev environment with Prisma engine access generates the real Prisma Client before build.

## Loop 8 — Recommended Concept Alignment
- [x] App copy updated to Commitment Vault positioning
- [x] Recovery-supportive angle kept as impact narrative, not clinical product claim
- [x] Landing page updated with safer product design copy
- [x] Create vault page updated with recommended demo framing
- [x] Reward wording changed from weekly reward focus to milestone reward focus
- [x] README updated with recommended direction
- [x] Demo script updated with safer language
- [x] Project plan updated with recommended hybrid strategy
- [x] Full proposal and pitch Markdown added
- [x] Post-update typecheck completed
- [x] Post-update build completed with `NEXT_TELEMETRY_DISABLED=1 npx next build`

## Loop 9 — Code Structure Polish
- [x] Frontend API calls centralized in `lib/api-client.ts`
- [x] Status label formatting centralized in `lib/status-labels.ts`
- [x] Create vault validation tightened
- [x] Invalid enum values blocked instead of defaulted silently
- [x] Top-up completion capped at target amount
- [x] Extra top-ups blocked after target is reached
- [x] Invalid `next lint` script replaced with MVP verification
- [x] MVP structure verification script added
- [x] Engineering loop report added
- [x] Typecheck passes after polish
- [x] MVP verification passes after polish
- [x] Next production build passes after polish

## Loop 10 — Structural Resilience and QA Hardening
- [x] Local domain constants/types added in `lib/domain.ts`
- [x] Prisma generated-type imports removed from app/service/domain code
- [x] Prisma Client loading made lazy for restricted build environments
- [x] API method handling centralized in `lib/api-methods.ts`
- [x] Demo config now reuses shared domain constants
- [x] MVP verifier expanded to check App Router page rendering and Pages API split
- [x] MVP verifier checks required Prisma models
- [x] MVP verifier checks required QA scripts
- [x] Typecheck passes after structural hardening
- [x] MVP verification passes after structural hardening
- [x] Next production build passes after structural hardening

## Loop 11 — UX Stepper and Non-Technical Demo Fixes
- [x] Create vault form converted into a guided three-step flow
- [x] Stepper component added with accessible active/done states
- [x] Stellar public key guidance added for non-technical users
- [x] One-click demo Stellar testnet public address added
- [x] Client-side step validation added before moving forward
- [x] Review step added before vault creation
- [x] White-on-white/low-contrast scan completed
- [x] Global autofill contrast styles added
- [x] Create vault page copy updated to explain the guided demo flow
- [x] Typecheck passes after UX fixes
- [x] MVP verification passes after UX fixes
- [x] Next production build passes after UX fixes

## Loop 12 — Simple UI Reset and Contrast Fix
- [x] Screenshot issue reviewed
- [x] Root cause identified: dark text styles conflicting with base white Card background
- [x] Global background reset to plain light gray
- [x] Shared Card component simplified
- [x] Landing page dark demo card removed
- [x] Create vault dark guidance card removed
- [x] Vault summary dark card removed
- [x] Stepper active state simplified to light readable styling
- [x] Progress bar simplified
- [x] Loading and empty states simplified
- [x] White-text-on-white-card issue removed from main content cards
- [x] Typecheck passes after reset
- [x] MVP verification passes after reset
- [x] Next production build passes after reset
- [x] Combined check passes after reset

## Loop 13 — End-to-End Audit and Workflow Completion
- [x] Product flow audited end to end
- [x] Frontend pages and components reviewed
- [x] Backend API route usage reviewed
- [x] Business logic dead ends identified
- [x] One-time lock partial-commitment dead end fixed
- [x] Periodic top-up reachability validation added
- [x] Top-up schedule count aligned to target amount
- [x] Reward milestone count aligned to reachable actions
- [x] Vault next-step guidance added
- [x] Commitment proof workflow completed
- [x] Technical proof failure text removed from user flow
- [x] Duplicate proof action prevented
- [x] Database indexes added
- [x] End-to-end audit document added
- [x] README updated
- [x] TypeScript check passed
- [x] MVP verification passed
- [x] Next production build passed
- [x] Combined check passed

## Loop 14 — Clerk Accounts, Dashboard, Receipts, and Proof History
- [x] Clerk dependency added
- [x] Clerk provider added through client wrapper
- [x] Sign-in page added
- [x] Sign-up page added
- [x] Header account navigation added
- [x] Account-required states added for protected product screens
- [x] API requests now send Clerk session bearer token
- [x] Pages API routes verify Clerk session tokens with `@clerk/backend`
- [x] `AppUser` model added
- [x] Vault ownership added through `appUserId`
- [x] `ProofReceipt` model added
- [x] Receipt service added
- [x] User service added
- [x] Dashboard page added
- [x] Receipt detail page added
- [x] Receipt history added
- [x] Vault creation automatically creates a proof receipt
- [x] Demo receipt fallback added when no Stellar proof signer is configured
- [x] Optional live Stellar testnet transaction proof added when server signer is configured
- [x] Explorer link stored for network-confirmed receipts
- [x] Print/export receipt action added
- [x] Auth and Stellar workflow documentation added
- [x] README updated
- [x] TypeScript check passed
- [x] MVP verification passed
- [x] Next production build passed with Clerk env placeholders
