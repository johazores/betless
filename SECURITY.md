# Security

Betless is testnet software. It is not ready to hold real customer funds.

## Current trust boundaries

- The treasury and early-withdrawal keys are held by the server. They never reach the browser.
- The ops account is an unconditional claimant on each testnet vault. It exists so a user can exit early, but it is also a centralized authority that must be protected.
- Clerk, PostgreSQL, the points ledger, reward fulfillment, and the simulated peso transfer are off-chain.
- Stellar writes use short timebounds. Signed XDR and the expected transaction hash are stored before submission so retries can be resolved by hash.
- If Stellar is not configured, settlement calls do nothing. A deployment in that state must not claim that deposits are locked on-chain.

## Before mainnet

Mainnet requires a separate security phase: multisig treasury policy, KMS or HSM-backed signers, withdrawal approval thresholds, key rotation and recovery procedures, reconciliation alerts, a licensed fiat/asset partner, and an independent security review.

## Reporting a problem

Do not include secrets, private keys, personal data, or a working exploit in a public issue. Contact the repository owner through the GitHub profile first and agree on a private channel. Include the affected route or transaction, expected behavior, actual behavior, and the smallest safe reproduction.
