# Account and Stellar Workflow

## Account Flow

Betless uses Clerk for account registration and sign-in, but account creation is optional during onboarding.

Users can:

- create a vault immediately;
- sign in first if they already have an account;
- connect an account after the vault is created;
- return later to view saved vaults and receipts from the dashboard.

## Guest Vault Access

When a user creates a vault without signing in, Betless creates a browser-held vault access token. The server stores only a hash of that token.

This lets the user open the same vault from the same browser without forcing account creation.

## Connecting an Account Later

When the user signs in after creating a vault, Betless connects the vault to the Clerk account and removes guest access from the vault record.

After connection, the vault appears in the dashboard.

## Stellar Workflow

Betless asks only for a Stellar public address. It never sends recovery phrases or private keys to the server.

Receipt creation validates the public address and saves a vault receipt. When a funded server-side Stellar signer is configured, the receipt can include a transaction hash, ledger number, and explorer link.

## Receipt Flow

A receipt contains:

- vault ID;
- public wallet address;
- receipt reference;
- transaction hash when available;
- ledger when available;
- memo when available;
- explorer link when available.

Users can open, print, and verify receipts from the vault page or dashboard.
