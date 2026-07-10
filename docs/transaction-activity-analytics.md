# Transaction, Activity, and Analytics Experience

## Goal

Betless should feel transparent and trustworthy. Users need to see what happened, when it happened, whether it completed, and whether it has a Stellar network reference.

## Activity model

Every important action creates an `ActivityEvent` record:

- Vault created
- Top-up recorded
- Reward issued
- Receipt saved
- Stellar payment confirmed
- Account connected

Each event includes:

- status
- timestamp
- vault link
- wallet address when relevant
- amount and asset when relevant
- transaction hash when available
- operation ID when available
- ledger when available
- explorer link when available

## Stellar terminology

The app only uses Stellar transaction wording when there is a real Stellar network record.

When a server-side signer is configured, Betless submits a small Stellar Testnet payment operation with a memo. The receipt stores the transaction hash, ledger, operation ID when available, and Stellar Expert explorer URL.

When network signing is not configured, Betless stores a receipt and marks network confirmation as pending. It does not pretend that an on-chain transaction exists.

## Activity page

The Activity page shows a chronological timeline grouped by date. Each item shows:

- action title
- status
- app or Stellar rail
- timestamp
- amount
- wallet
- reference
- details panel
- explorer link when available

## Dashboard analytics

The dashboard includes:

- total balance
- total deposits
- total withdrawals
- rewards earned
- rewards redeemed
- savings progress
- completed activity count
- monthly activity
- vault growth
- recent account activity

The charts use simple, readable bars so the dashboard stays fast and easy to understand.

## Production behavior

For production, Betless should use licensed financial partners for real deposits and withdrawals. Stellar records should be reserved for actual payment, reward, claimable-balance, or settlement operations. App-only actions remain app events and should not be presented as blockchain transactions.
