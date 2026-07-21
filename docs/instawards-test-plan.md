# Instawards test plan

The final test report must record the commit SHA, command, environment, timestamp, result, and every applicable transaction or account reference.

## Multisignature policy

- Verify the early-exit account has exactly the intended three weight-1 signers.
- Verify low, medium, and high thresholds are 2.
- Prove one signature cannot authorize the early-exit envelope.
- Prove each valid signer pair can authorize the envelope.
- Reject duplicate approval by the same signer.
- Reject an expired, replayed, changed, or vault-mismatched envelope.
- Confirm an approved early exit contains only the expected claim and treasury payment operations.
- Confirm no deployed web process has access to every approver credential.

## Claimable-balance lifecycle

- Create a PHPC claimable balance with the expected treasury maturity predicate and early-exit claimant.
- Reject treasury claim before maturity.
- Confirm treasury claim at maturity.
- Confirm a valid 2-of-3 early exit claims and returns the represented amount to treasury atomically.
- Reject a missing trustline, underfunded treasury, wrong network, wrong asset issuer, and already-claimed balance.

## Predicate-aware reconciliation

- Match the database balance ID, asset code, issuer, amount, treasury claimant, maturity timestamp, predicate type, early-exit claimant, and claimant-account thresholds.
- Report missing database balances, orphaned chain balances, amount mismatches, claimant mismatches, predicate mismatches, and policy mismatches.
- Make a confirmed mismatch outrank pending work.
- Return unavailable rather than verified when Horizon cannot be reached.
- Verify pagination beyond 200 balances.
- Ensure the public response contains no private user or credential data.

## Global outbox recovery

- Process every PENDING and SUBMITTED operation, not only operations for a recently viewed vault.
- Confirm submitted transactions by hash before rebuilding.
- Leave a transaction submitted while its timebound can still land.
- Rebuild only after the original envelope is expired and absent.
- Prevent two sweepers from submitting the same operation.
- Never resubmit a confirmed row.
- Recover when Horizon confirms but the first database update fails.
- Return a clear unavailable result when Stellar is not configured.

## End-to-end evidence journeys

1. Create, lock, reconcile, mature, and release a vault.
2. Create, lock, reconcile, collect two approvals, and execute an early exit.
3. Inject a reconciliation mismatch, show it publicly, correct it, and return to matched.
4. Simulate an unknown Horizon result and prove only one final transaction exists.
5. Run the public reviewer journey from the Trust page to the relevant Stellar Expert records.

## Required outputs

- CI result and critical-path test report.
- Testnet account-threshold evidence.
- Configuration transactions.
- Successful multisigned early-exit receipts.
- Rejected one-signature and tamper test output.
- Per-vault reconciliation export.
- Global sweep command and API examples.
- Complete machine-readable and human-readable receipt lists.
- A 3-5 minute technical walkthrough.
