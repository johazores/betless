# Betless Demo Guide

A step-by-step script for presenting Betless: what to click, what to say, where Stellar fits, and how to answer the hard questions.

---

## 1. Where Betless fits in the workshop ideas

Betless sits in **Category 2: Financial Inclusion & Underbanked**, and it deliberately combines three ideas rather than copying one:

| Idea | What Betless takes from it |
|---|---|
| **#289 — Time-Locked Savings for Big Purchases** | The core mechanic: deposit locked until a future date so savers can't raid their own goal. Betless implements the lock with a **native claimable balance time predicate** instead of a Soroban contract. |
| **#102 — Vault with Emergency Exit** | The user always retains an exit: early withdrawal is available at any time, with a transparent flat/1% fee shown before confirmation — no trapped funds. |
| **#7 — Remittance Savings Pot** (spirit of) | The behavioral problem: money that arrives gets spent. Betless converts saving into a commitment device with monthly rewards as positive reinforcement. |

One more point worth making out loud: the ideas list's own audit says vault contracts are the single most oversaturated pattern (66+ existing projects) and calls out **claimable balances as a deliberately underused primitive**. Betless is a savings vault that uses **zero smart contracts** — the lock is enforced by a first-class Stellar ledger entry. That is the differentiator, not a limitation.

---

## 2. Pre-demo checklist (do this the night before)

```bash
npm install
npm run stellar:setup        # once — creates testnet issuer/treasury/ops, prints STELLAR_* env values
# paste printed values into .env (already done for this machine)
npm run db:reset:force       # clean database
npm run dev                  # start the app, sign up with your demo account
npm run demo:seed            # backdated vaults: one mid-lock with points, one about to mature
npm run stellar:smoke        # optional: proves lock+release round-trip on testnet
```

`demo:seed` gives you a dashboard that looks alive: an active ₱50,000 vault at month 5 with ~835 points and a verified on-chain lock, plus a ₱25,000 vault that **matures live on your first dashboard load** — its principal is claimed on-chain at that moment, which is a great story beat.

The deposit flow's security verification is a placeholder: the code is always **123456** (a hint is shown in dev builds, hidden in production builds).

Keep two browser tabs ready:

1. The app (`localhost:3000`).
2. stellar.expert on the **treasury account** (URL printed by `stellar:setup`) — every vault lock and release is visible there.

---

## 3. Demo flow and talking points

### Step 1 — Landing page (`/`)

Do: scroll slowly through hero → how it works → the three promises → rewards.

Say:

> "Betless is commitment savings for the Philippines. The behavioral problem is universal: people save, then spend their own savings. Betless flips that — you lock a deposit for 12 months or more, earn about 4% a year as points you can spend on groceries or travel, and get 100% of your deposit back at maturity."

Point at the "Your money comes back" card:

> "That promise is the entire product. Which is why we don't just store it in our database — every vault lock is independently verifiable on the Stellar network. We'll see that in a minute."

### Step 2 — Sign up

Do: sign up (or sign in with the seeded demo account).

Say:

> "Users never see keys, wallets, or gas. Auth is a normal email sign-up. The blockchain is infrastructure here, not the user experience."

### Step 3 — Dashboard (`/dashboard`)

Do: let it load. If the seeded past-maturity vault was still active, it settles **right now** — point at the "Matured" card.

Say:

> "Top of the screen, always visible: locked balance and available points. This vault just matured — the full ₱25,000 principal was returned automatically, the vault closed, and the points stay. Behind the scenes, the on-chain lock for that vault was just claimed on Stellar — the money's release is as verifiable as its lock."

Point at the small **"Lock verified"** badge on the active vault card:

> "Each active vault carries a quiet verification indicator. We deliberately don't shout 'blockchain' — savers care that the money is safe, not how."

### Step 4 — Create a vault (`/create-vault`)

Do: walk the four-step cash-in flow — enter ₱25,000 / 12 months (read the live preview aloud: points per month, maturity date, early-exit fee) → pick GCash → review the transfer summary → enter the verification code **123456** → land on the receipt.

Say:

> "The deposit feels exactly like cashing in with GCash or your bank: choose a method, review a transfer summary with the fee disclosed **before** you commit, confirm with a one-time code, get a receipt with a reference number. Familiar rails, zero crypto vocabulary. The verification step is a placeholder authenticator today — the flow is shaped so a real SMS or TOTP provider drops in without UI changes."

Click "View my vault" on the receipt:

> "In those two seconds, the deposit was locked in a claimable balance on Stellar — a native ledger entry with a time predicate. The network itself will refuse to release it to the treasury before the maturity date. That's not our code enforcing the lock; it's the protocol."

### Step 5 — Vault detail (`/vaults/[id]`)

Do: scroll to the **On-chain verification** card. Click **"View lock transaction ↗"** — stellar.expert opens with the live testnet transaction.

Say:

> "Here's the receipt. This is a public, third-party view of the lock: the amount, the asset, and the claim conditions — claimable by the treasury only after maturity. A regulator, an auditor, or a skeptical user can verify every peso we claim to hold, without trusting our database."

Then show the early-withdrawal section:

> "And the emergency exit: withdraw any time, fee shown up front — flat ₱500 up to ₱50k, 1% above. Confirm, and one atomic Stellar transaction claims the balance and settles it back — there's no state where the lock is released but the money is unaccounted for."

(Optional: actually withdraw the freshly created vault to show the confirmation flow and the release transaction link.)

### Step 6 — Rewards (`/rewards`)

Do: redeem a ₱500 grocery voucher with seeded points. Show the voucher code.

Say:

> "Points are the motivation loop — about 4% of the deposit per year, 1 point = ₱1, starting after the first full month. Redemptions are instant vouchers for real merchants. Points live off-chain on purpose: they're high-frequency product surface, not a trust promise. The principal is the trust promise, and that's what's on-chain."

### Step 7 — Close the loop

Say:

> "So the full journey: sign up, lock a deposit, watch it verifiably sit on Stellar, earn points monthly, redeem real rewards, get 100% back at maturity — automatically. Simple on the surface, verifiable underneath."

---

## 4. Where Stellar adds value (and why it stays subtle)

**The one-sentence version:** *the database runs the product; the chain custodies the promise.*

A Betless vault is a promise — "your money cannot move until this date, then it all comes back." Stellar is the only layer in the stack that can make that promise **verifiable by anyone**:

- **Claimable balances with time predicates** are a native Stellar primitive that is *exactly* a commitment vault. The network enforces the lock; Betless couldn't move the principal early even if it wanted to (only the segregated ops signer can, for the user's own early withdrawal).
- **Public auditability**: every lock and release is a public transaction. "Proof of reserves" is a query, not a press release.
- **Atomic settlement**: claim + settlement happen in one transaction — no partial states with money in limbo.
- **Near-zero cost, 5-second finality**: locking a vault costs a fraction of a centavo, so on-chain custody doesn't change the unit economics of a ₱10,000 deposit.

Why it isn't plastered across the UI: the target user is a saver, not a crypto user. Blockchain-forward UI ("wallet", "keys", "gas") adds anxiety to a product whose entire job is to feel safe and boring. Trust indicators work best the way TLS padlocks do — small, consistent, and checkable when you care.

**Where Stellar surfaces in the UI (deliberately, and only here):**

| Surface | Indicator | Why there |
|---|---|---|
| Vault card (dashboard) | "Lock verified" badge | Glanceable reassurance where users check their money |
| Vault detail | "On-chain verification" card: status, balance ID, explorer links | The one place a user inspects a single vault deeply — receipts belong here |
| Create-vault preview | One sentence: the lock is recorded on Stellar and independently verifiable | Sets the trust expectation at the moment of commitment |
| Landing page promise + footer | One clause each | Public trust claim for prospects, without a dedicated "blockchain" section |

---

## 5. Questions judges may ask — and answers

**"Is this real or mocked?"**
> Real. Every vault creation submits a `createClaimableBalance` transaction to Stellar testnet; maturity and early withdrawal claim it back. Here's the transaction on stellar.expert. `npm run stellar:smoke` runs the full round-trip live.

**"Why no Soroban smart contract?"**
> Because we don't need one. A time-locked vault maps 1:1 to a claimable balance with a `not(before(maturity))` predicate — a native ledger primitive. A contract would add an audit surface, deployment lifecycle, and fees for zero extra capability. The workshop's own audit lists 66+ Soroban vault projects; using the underused native primitive is the differentiator. If we later need conditional logic (purpose-locked payouts), Soroban is the escape hatch.

**"Where do users' pesos actually come from? Is the fiat leg real?"**
> In the demo, deposits are simulated — the treasury holds a pre-minted test PHPC float. Production design (documented in `docs/stellar-architecture.md`) uses a licensed Philippine anchor via SEP-24: GCash/InstaPay in, PHPC to the treasury, memo-tagged per vault. The on-chain custody layer we built is unchanged by that swap.

**"Who holds the keys? What if you get hacked?"**
> Users are custodial — no key management for savers. The demo runs a single treasury signer; the production design is a 2-of-3 multisig treasury with an ops signer for routine operations and a KMS-held co-signer for payouts above a threshold. Note the lock itself protects users even from us: the treasury cannot claim before maturity. Early withdrawals go through a separate, segregated ops signer.

**"What happens if Stellar or Horizon is down?"**
> The product degrades gracefully instead of breaking: vault creation still succeeds, and the on-chain write is recorded as a pending operation in an outbox table — signed XDR persisted before submission, resolved idempotently by transaction hash, retried lazily on reads. The database stays authoritative for UX; the chain is authoritative for money.

**"How do you prevent double-submission or lost transactions?"**
> The outbox pattern: intent is written to Postgres before any network call; the signed envelope and its expected hash are persisted before submission; every transaction carries 60-second timebounds so a lost submission expires deterministically instead of lingering. Timeouts are resolved by hash lookup, not resubmission guesses.

**"Why are points not on-chain?"**
> Points are monthly micro-accruals across all users — dust with no external utility until a merchant accepts them directly. On-chain points would add trustlines, reserves, and auth flags for zero user benefit. The principal is the trust surface; points are product surface. If partner merchants ever accept points natively, they become an `auth_required` + clawback-enabled asset — that's a documented future phase, not an oversight.

**"Does this scale? One treasury account is a sequence-number bottleneck."**
> Correct, and it's a known, solved problem: channel accounts for parallel submission, and the outbox already serializes writes safely at demo scale. Muxed addresses keep per-user attribution on the pooled account without per-user base reserves.

**"Points accrue 'lazily' — what if nobody logs in?"**
> Accrual is deterministic from the vault's start date, so the ledger is always correct on read — idempotent via a unique (vault, month) constraint. Production adds a daily sweeper for maturity payouts; the same code path already exists and is triggered by reads today.

**"What's the business model?"**
> Deposits are invested through licensed custodial partners; the spread between investment yield and the ~4% points cost funds the platform, plus early-withdrawal fees. Deliberately abstracted from the UI — savers see points, not portfolio mechanics.

---

## 6. Extra polish worth doing before the demo (optional)

- **Rehearse the maturity moment**: run `npm run demo:seed` shortly before presenting so the past-maturity vault settles live during your dashboard load.
- **Pin browser tabs** in order: app, stellar.expert treasury account, this guide.
- **Have `docs/stellar-architecture.md` open** — the sequence diagrams answer deep-dive questions faster than talking.
- If asked for code, show `services/stellar-service.ts` (the outbox + lock/release) and `lib/vault-rules.ts` (one module, all business rules) — both are short and read well on a projector.
- Don't demo on hotel Wi-Fi without a fallback: if Horizon is unreachable, the app still works fully off-chain — which is itself a talking point ("this is the graceful-degradation design working").
