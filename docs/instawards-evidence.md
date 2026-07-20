# Instawards evidence register

This page separates what Betless can prove now from what a future sprint must deliver. It should stay factual. Links belong here only when an outside reviewer can open them.

## Public evidence available now

| Item | Evidence | Status |
| --- | --- | --- |
| Source repository | https://github.com/johazores/betless | Public |
| Testnet application | https://bet-less.vercel.app | Public |
| Health endpoint | https://bet-less.vercel.app/api/health | Public |
| Stellar implementation | `services/stellar-service.ts` | In repository |
| Testnet account setup | `scripts/setup-stellar-testnet.mjs` | In repository |
| Live settlement smoke test | `scripts/smoke-stellar.ts` | In repository; writes to testnet |
| Architecture and trust boundaries | `docs/stellar-architecture.md`, `SECURITY.md` | In repository |
| Automated checks | `npm run check` | Local and CI |

## What the current code proves

- `createClaimableBalance` creates one claimable balance per configured vault.
- The treasury claimant cannot claim before the vault maturity timestamp.
- The separate ops claimant can close a vault for a user-requested early withdrawal.
- Lock and release transactions are built with timebounds.
- Signed XDR and the expected transaction hash are persisted before submission.
- Submitted operations are checked by hash before a retry is rebuilt.
- The vault detail response includes claimable-balance and Stellar Expert receipt data.

## Evidence that must be added at sprint completion

Do not mark these complete until the public URL works in a signed-out browser.

| Deliverable | Required public evidence |
| --- | --- |
| Reconciliation engine | API URL, example JSON response, test report, pull request, and at least one balance checked against Stellar Expert |
| Proof-of-custody page | Live page, screen recording, source pull request, and direct links for every displayed balance |
| Outbox sweeper | Command or protected endpoint documentation, retry test report, source pull request, and lock/release transaction URLs |
| Validation package | 3–5 minute technical demo, copyable integration guide, test report, and one complete receipt list |

## Known gaps

- The repository is a monorepo. Frontend and backend paths are listed in the README; there is no Soroban contract because the product uses native claimable balances.
- Existing testnet transaction URLs still need to be collected into a stable public receipt list.
- The current server-held signer model is centralized. Multisig/KMS hardening is future work.
- Production fiat rails, a licensed asset/anchor partner, mainnet deployment, and a third-party audit are not complete.
- An Ambassador Chapter Lead still needs to review the final scope and evidence.
