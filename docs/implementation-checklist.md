# Implementation Checklist

## Product Flow
- [x] Create Vault is the primary landing CTA.
- [x] Vault creation works without requiring sign-in first.
- [x] Existing users can sign in before creating a vault.
- [x] Guest users can connect an account after vault creation.
- [x] Vault detail page always shows the next action.
- [x] Dashboard shows saved vaults and receipts for signed-in users.
- [x] Receipt page supports guest access and account access.

## Wallet Experience
- [x] User can create a new wallet in the browser.
- [x] User can use an existing Stellar public address.
- [x] Recovery key is shown only client-side.
- [x] UI warns users not to enter recovery phrases or private keys.

## Backend
- [x] Vault APIs support Clerk account access.
- [x] Vault APIs support browser-held guest access tokens.
- [x] Receipt APIs support account and guest vault access.
- [x] Top-up completion validates vault ownership/access.
- [x] Reward claim validates vault ownership/access.
- [x] Account connection clears guest access after ownership transfer.

## Business Logic
- [x] One-time lock requires full target upfront.
- [x] Recurring top-up plans must reach the target within the selected period.
- [x] Saved amount is capped at target.
- [x] Duplicate top-up completion is blocked.
- [x] Duplicate reward claim is blocked.
- [x] Rewards are fixed milestones.

## UX and Copy
- [x] User-facing copy is short and action-oriented.
- [x] Technical implementation language is hidden from normal users.
- [x] No low-contrast white-on-white cards.
- [x] No chance-based or gambling-adjacent wording.
- [x] No unfinished product labels in user-facing screens.

## QA
- [x] TypeScript check passes.
- [x] Product verifier passes.
- [x] Next production build passes with Clerk environment values.

## Loop 19 — Guest Session Continuity
- [x] Browser guest session token added
- [x] Guest vaults reuse one session token
- [x] Dashboard works before sign-in
- [x] Receipt history works before sign-in
- [x] Activity page added
- [x] Bulk guest progress connection added
- [x] `/api/session/connect` added
- [x] Guest progress connects to Clerk account after sign-in
- [x] Guest token is cleared after account connection
- [x] TypeScript check passes
- [x] MVP verification passes
- [x] Next build passes

## Loop 20 — Transaction Activity and Analytics
- [x] Added stored activity events.
- [x] Added Stellar-aware transaction references.
- [x] Added Activity timeline.
- [x] Added Analytics API.
- [x] Added dashboard metrics and simple charts.
- [x] Added migration for ActivityEvent.
- [x] Updated transaction and analytics documentation.


## Loop 21 — Stellar Explorer Verification
- [x] Added shared Stellar Explorer URL builder.
- [x] Added automatic Testnet/Mainnet explorer selection.
- [x] Added source account and destination account fields to receipts.
- [x] Added source account and destination account fields to activity events.
- [x] Added account-level explorer links when no transaction hash exists.
- [x] Added transaction-level explorer links when a transaction hash exists.
- [x] Updated Receipt page with **View on Stellar Explorer**.
- [x] Updated Vault receipt card with **View on Stellar Explorer**.
- [x] Updated Activity timeline with **View on Stellar Explorer**.
- [x] Updated Dashboard recent activity with Stellar Explorer links.
- [x] Added database migration for Stellar explorer fields.
- [x] TypeScript check passes.
- [x] Product verifier passes.
- [x] Next production build passes.
