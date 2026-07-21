# Instawards evidence register

This page separates what Betless can prove now from what the proposed sprint must deliver. It must stay factual. A link belongs here only when an outside reviewer can open it without requesting private access.

## Public evidence available now

| Item | Evidence | Status |
| --- | --- | --- |
| Source repository | https://github.com/johazores/betless | Public |
| Testnet application | https://bet-less.vercel.app | Must be checked in a signed-out browser before submission |
| Health endpoint | https://bet-less.vercel.app/api/health | Must be checked before submission |
| Stellar implementation | `services/stellar-service.ts` | Implemented |
| Testnet account setup | `scripts/setup-stellar-testnet.mjs` | Implemented |
| Baseline receipt test | `scripts/smoke-stellar.ts` | Writes testnet transactions and exports a receipt manifest |
| Multisig policy setup | `scripts/configure-early-exit-multisig.mjs` | Reproducible testnet setup artifact; approval flow remains sprint work |
| Architecture and trust boundaries | `docs/stellar-architecture.md`, `SECURITY.md` | Public |
| Automated checks | `npm run check` | Local and CI |

## What the current code proves

- `createClaimableBalance` creates one claimable balance per configured vault.
- The treasury claimant cannot claim before the vault maturity timestamp.
- The current separate ops claimant can close a vault for a user-requested early withdrawal.
- Lock and release transactions use short timebounds.
- Signed XDR and the expected transaction hash are persisted before submission.
- Submitted operations are checked by hash before a retry is rebuilt.
- The vault detail response includes claimable-balance and Stellar Expert receipt data.
- The public transparency service now reports confirmed ID or amount mismatches before pending settlement state.

The current early-exit path still uses one server-held ops key. It is the baseline risk the proposed D1 deliverable removes. The repository must not describe the current early-exit path as multisignature.

## Multisignature policy required by D1

The early-exit claimant account must have three weight-1 signers and require two signatures.

- `claimClaimableBalance` uses the account low threshold, so the low threshold must be 2.
- The same early-exit envelope includes a payment to treasury, so the medium threshold must be 2.
- Signer and threshold changes use the high threshold, so the high threshold must be 2 or stronger.
- The additional approver credentials must remain outside the web application process.

The configuration script produces an account URL and configuration transaction list. It does not replace the proposed signer-separated prepare, approve, and submit workflow.

## Evidence required at sprint completion

| Deliverable | Required public evidence |
| --- | --- |
| D1 - multisignature early exit | Account-threshold URL, configuration receipts, approval API/CLI examples, one-signature rejection test, successful 2-of-3 receipts, PR, commit, and CI run |
| D2 - reconciliation hardening | Live API and Trust page, per-vault claimant/predicate/asset/amount evidence, test report, PR, and explorer links |
| D3 - global outbox recovery | Protected endpoint and CLI guide, timeout and duplicate tests, receipt export, PR, and CI run |
| D4 - validation package | 3-5 minute technical demo, copyable integration guide, final test report, tagged release, and complete receipt list |

## Receipt manifest rules

Every successful transaction counted in the SOW must include its action, network, transaction hash, complete Stellar Expert URL, source account, claimable-balance ID when applicable, test-case reference, and confirmation time. Rejected envelopes belong in the test report and are not counted as successful transactions.

## Submission checks

- [ ] The final SOW and readiness checklist both state 100 hours at USD 50 per hour for a USD 5,000 request.
- [ ] No stale 90-hour, USD 55, or USD 4,950 figures remain.
- [ ] Live dApp, health, Trust, and public evidence URLs work from a signed-out browser.
- [ ] The Ambassador Chapter Lead reviewed the final scope.
- [ ] The Chapter Lead accepted the monorepo structure in writing.
- [ ] The planned approver roles and operational credential separation are documented.
- [ ] Every completion claim has a commit, PR, CI run, live URL, account URL, or transaction receipt.
- [ ] Testnet PHPC and simulated fiat are never described as live peso custody.

## Known gaps

- Frontend and backend remain in one public monorepo. No Soroban repository applies because Betless uses Stellar Classic claimable balances.
- The signer-separated early-exit approval workflow is proposed work and is not complete.
- Persisted predicate-aware reconciliation and the global outbox sweeper are proposed work.
- Production fiat rails, a licensed anchor or custodian, mainnet deployment, KMS/HSM custody, and an independent security review are not complete.
- An Ambassador Chapter Lead still needs to verify the final application and evidence plan.
