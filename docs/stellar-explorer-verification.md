# Stellar Explorer Verification

## Goal

Users should be able to verify Stellar activity independently. The app must not rely only on internal success messages.

## What every Stellar transaction shows

When a Stellar transaction is confirmed, Betless shows:

- transaction hash
- source account
- destination account
- network
- status
- ledger when available
- operation ID when available
- **View on Stellar Explorer** button

## Explorer behavior

Betless uses Stellar Expert links.

- `STELLAR_NETWORK=TESTNET` links to Testnet Explorer.
- `STELLAR_NETWORK=PUBLIC` links to Public/Mainnet Explorer.

The same network value is used for Horizon, transaction building, and explorer URLs.

## Receipt behavior

If a transaction hash exists, the explorer button opens the Stellar transaction page.

If no transaction hash exists, the explorer button opens the related Stellar account page instead. This gives users a way to inspect the wallet without pretending that a transaction was submitted.

## Important rule

App receipts and wallet receipts are not presented as on-chain transactions unless a real transaction hash exists.
