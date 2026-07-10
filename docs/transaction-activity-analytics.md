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
- **View on Stellar Explorer** link when a Stellar wallet or transaction reference exists

## Stellar verification

The app only uses Stellar transaction wording when there is a real Stellar network record.

Every confirmed Stellar transaction displays:

- transaction hash
- source account
- destination account
- active network
- status
- ledger when available
- operation ID when available
- **View on Stellar Explorer** link

The explorer URL is generated from the active Stellar network. Testnet records link to Stellar Expert Testnet. Mainnet records link to Stellar Expert Public.

When a server-side signer is configured, Betless submits a small Stellar payment operation with a memo. The receipt stores the transaction hash, ledger, operation ID when available, source account, destination account, and explorer URL.

When network signing is not configured, Betless stores a wallet receipt and shows an account-level Stellar Explorer link. It does not claim that an on-chain transaction exists unless a transaction hash exists.

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
- **View on Stellar Explorer** link when a Stellar wallet or transaction reference exists

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
