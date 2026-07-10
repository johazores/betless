# Guest Session Continuity

## Problem

Users can create a wallet and start using Betless before creating an account. If that progress only belongs to a single page or one vault link, users may feel that their wallet, receipts, rewards, or activity disappeared when they return later or sign in.

## Product Decision

Betless now uses a browser-held guest session token for fast onboarding.

A user can:

- Create a wallet immediately.
- Create one or more vaults before signing in.
- View vaults, receipts, and activity from the same browser.
- Sign in later and connect all browser-saved progress to the account.

## User Journey

1. User opens Betless.
2. User clicks **Create Vault**.
3. User creates a wallet or uses an existing Stellar address.
4. Betless creates a browser session token.
5. The vault, receipts, rewards, and activity are tied to that browser session.
6. User can return to the dashboard in the same browser without signing in.
7. When the user signs in, Betless connects all browser-saved vaults and receipts to the account.
8. The guest token is cleared after account connection.
9. The dashboard then loads the account history.

## Backend Design

Guest access uses the `x-vault-token` request header.

The token is never stored directly. The backend stores only a SHA-256 hash in `Vault.guestAccessTokenHash`.

When the user signs in, `/api/session/connect`:

- verifies the Clerk session,
- finds all vaults with the guest token hash,
- attaches those vaults to the local `AppUser`,
- attaches related receipts to the same user,
- clears guest access on the connected vaults.

## Frontend Design

The browser stores one guest session token under:

```txt
betless:guest-session-token
```

The same token is reused for all guest-created vaults. This keeps the user's history together instead of creating disconnected vault links.

The dashboard works in both states:

- Signed out: shows browser-saved vaults and receipts.
- Signed in: shows account-saved vaults and receipts.

## UX Rules

- Do not force sign-in before vault creation.
- Show a save-account prompt after value is created.
- Keep the prompt short and non-blocking.
- Never tell users their progress is gone if a browser token exists.
- After sign-in, connect progress automatically.
- Keep receipts and activity visible before and after account connection.

## Security Notes

- Guest access is device/browser scoped.
- Guest tokens are high-entropy random values.
- Only hashes are stored in the database.
- Account connection requires a verified Clerk session.
- After account connection, guest token access is cleared from connected vaults.

## Limitations

Browser-saved access is not portable across devices until the user creates or signs into an account. The UI explains this with a clear prompt: create an account to access the history anywhere.
