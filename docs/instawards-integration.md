# Instawards integration and verification guide

This guide covers the current testnet evidence commands and the public artifacts added during the submission-hardening pass. The signer-separated early-exit approval workflow and predicate-aware reconciliation endpoint remain proposed sprint deliverables until their final implementation, tests, and receipts are published.

## Prerequisites

- Node.js 22
- PostgreSQL
- Stellar testnet configuration
- A funded testnet PHPC issuer, treasury, and ops account from `npm run stellar:setup`

Copy `.env.example` to `.env` and replace every placeholder. Do not reuse example values in a deployed environment.

## Repository checks

```bash
npm ci
npm run prisma:generate
npm run check
```

The Instawards audit verifies the MIT license, required evidence documents, Stellar code paths, 2-of-3 threshold configuration, repository history, and the absence of the previous reusable admin defaults.

## Current baseline receipt run

```bash
npm run stellar:smoke
```

The command creates a test vault, locks PHPC through a claimable balance, exercises the current single-key early-exit path, and writes:

```text
artifacts/betless-baseline-receipts.json
```

Use this only as evidence of the current baseline. It must not be presented as multisignature evidence.

To preserve the local database rows used by the evidence run:

```bash
PRESERVE_STELLAR_SMOKE=1 npm run stellar:smoke
```

## Configure the proposed testnet 2-of-3 policy

Generate or securely create two additional approver keypairs outside the web application. Put only their public keys in:

```text
STELLAR_APPROVER_B_PUBLIC_KEY
STELLAR_APPROVER_C_PUBLIC_KEY
```

Run:

```bash
npm run stellar:configure-multisig
```

The script adds the two public signers and configures the early-exit account with:

- master signer weight: 1;
- approver B weight: 1;
- approver C weight: 1;
- low threshold: 2;
- medium threshold: 2;
- high threshold: 2.

It writes the account and configuration transaction evidence to:

```text
artifacts/early-exit-multisig.json
```

The low threshold is explicitly set to 2 because `claimClaimableBalance` is a low-threshold operation. The medium threshold protects the payment operation in the same early-exit envelope. The high threshold protects later signer-policy changes.

Do not run the bootstrap again after the high threshold has changed. Later signer changes must use the separated approval process.

## Global outbox sweep

The CLI processes unresolved `PENDING` and `SUBMITTED` Stellar operations across all vaults:

```bash
npm run stellar:sweep
```

The database lease prevents overlapping sweeps. Each submitted operation is checked by its stored transaction hash before an expired envelope can be rebuilt.

The protected API equivalent is:

```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  "$NEXT_PUBLIC_APP_URL/api/internal/stellar/sweep"
```

The secret is accepted only through the Authorization header.

## Evidence review

For every successful record in an artifact:

1. Open the complete Stellar Expert testnet URL.
2. Confirm the source account, operation types, asset, amount, and transaction result.
3. For claimable balances, compare the balance ID and claimant predicates with the application record.
4. Record the commit SHA and CI run that generated the artifact.

A failed or rejected transaction belongs in the test report and must not be counted as successful on-chain activity.
