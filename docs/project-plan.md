# Betless Project Plan

## Product Direction

Betless is a commitment savings app. Users create a vault, set a goal, follow a lock or top-up plan, claim fixed milestone rewards, and save a receipt.

## Positioning

Betless is a money-protection and commitment tool. It does not use chance mechanics, does not operate as a financial custodian, and does not claim to provide treatment.

## Primary User Journey

1. User selects **Create Vault**.
2. User creates a new wallet or uses an existing Stellar public address.
3. User sets a savings target and lock period.
4. User selects one-time lock or recurring top-up.
5. User selects a fixed milestone reward.
6. System creates the vault and receipt.
7. User can track progress immediately.
8. User can connect an account later for dashboard history.

## Architecture

- App Router renders pages.
- Pages API routes handle backend requests.
- Services contain business logic.
- Prisma manages data access.
- Clerk is optional during onboarding and required for dashboard history.
- Stellar SDK validates wallet addresses and can attach network receipt details when configured.

## Data Model

- `AppUser` maps Clerk users.
- `Vault` stores commitment plans and guest access hash.
- `TopUp` stores scheduled progress actions.
- `RewardClaim` stores fixed milestone rewards.
- `ProofReceipt` stores saved vault receipts and optional network references.

## Completion Rules

- A user can create a vault without signing in.
- A guest vault can be reopened from the same browser.
- A signed-in user can connect a guest vault to their account.
- One-time locks require the full target amount upfront.
- Recurring plans must be able to reach the target within the selected period.
- Rewards are fixed and tied to progress.
- Receipts are created without exposing recovery phrases or private keys.

## Next Improvements

- Partner wallet connection.
- Voucher supplier integration.
- Partner-managed fund custody.
- Account recovery for lost guest vault access.
- Email receipt delivery.

## Guest-to-Account Continuity

Betless allows users to start immediately without sign-in. To prevent lost progress, the app creates one browser-held guest session token and reuses it across guest vaults, receipts, rewards, and activity.

When the user signs in, Betless automatically connects every browser-saved vault and receipt to the Clerk-backed account through `/api/session/connect`. This keeps onboarding fast while giving users a safe path to permanent account access.

## Loop 20 — Transaction Activity and Analytics
- [x] Added stored activity events.
- [x] Added Stellar-aware transaction references.
- [x] Added Activity timeline.
- [x] Added Analytics API.
- [x] Added dashboard metrics and simple charts.
- [x] Added migration for ActivityEvent.
- [x] Updated transaction and analytics documentation.


## Stellar Explorer Verification

Every Stellar-related record provides a direct **View on Stellar Explorer** path.

- Confirmed transactions link to the transaction page.
- Wallet receipts link to the Stellar account page.
- Explorer URLs switch automatically between Testnet and Mainnet based on the active network.
- Receipts store source account, destination account, transaction hash, operation ID, ledger, and explorer URLs when available.
- The app does not claim that an on-chain transaction exists unless a transaction hash is stored.
