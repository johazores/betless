# Betless

Betless is a Stellar-powered commitment savings and recovery rewards MVP.

It uses App Router for page rendering and Pages Router API routes under `/pages/api` for backend endpoints.

## What this MVP does

- Creates a commitment savings vault
- Stores vault, top-up, and reward records with Prisma/PostgreSQL
- Shows a polished vault detail page
- Lets a user mark the next top-up as completed
- Unlocks a fixed weekly reward after progress
- Generates a demo-only mock voucher code
- Validates Stellar public keys with Stellar SDK
- Attempts a graceful Stellar testnet proof status

## What this MVP does not do

- No real GCash integration
- No real voucher supplier
- No real money custody
- No real yield
- No auth/KYC
- No chance mechanics
- No ticket or random reward mechanics

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Demo flow

1. Open the landing page.
2. Click **Create a Betless Vault**.
3. Enter a Stellar testnet public address.
4. Use the demo defaults: ₱10,000 target, ₱2,000 monthly top-up, 12 months.
5. Create the vault.
6. On the vault detail page, mark the next top-up completed.
7. Claim the available weekly reward.
8. Create Stellar proof.

## Testnet wallet note

Only a Stellar public key is required. Never paste a private key or secret key into the app.

## Health check

```txt
GET /api/health
```
