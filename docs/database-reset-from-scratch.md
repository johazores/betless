# Database Reset From Scratch

Use this when the local or Neon development database has migration drift, missing tables, or old pre-authentication demo rows.

This reset intentionally deletes all development data and recreates the schema from the current Betless baseline migration.

## When to use this

Use this if you see errors such as:

```txt
Drift detected: Your database schema is not in sync with your migration history.
```

or:

```txt
The table `public.ProofReceipt` does not exist in the current database.
```

or:

```txt
Added the required column `appUserId` to the `Vault` table without a default value.
```

## Recommended command

From the project root:

```bash
npm run db:reset:force
```

This runs Prisma reset, applies the fresh baseline migration, generates Prisma Client, and runs the seed command.

## Manual command version

```bash
npx prisma migrate reset --force
npm run prisma:generate
npm run prisma:seed
```

`prisma migrate reset` normally runs the seed command automatically when the seed command is configured. Running `npm run prisma:seed` again is optional if the first reset already seeded successfully.

## What should exist after reset

The database should contain these tables:

- `AppConfig`
- `AppUser`
- `Vault`
- `TopUp`
- `RewardClaim`
- `ProofReceipt`

The seed should create:

- one demo app user
- one demo periodic top-up vault
- top-up rows
- reward milestone rows
- app config for reward rate

## Why this reset was needed

Earlier Betless builds introduced Clerk account ownership and proof receipts after the original anonymous-vault schema. That created migration drift in development databases that already had old rows or old migration history.

The current project now uses a fresh baseline migration that includes the full account, vault, top-up, reward, and receipt schema in one place.

## Important production note

This command is only for development and demo databases. Do not run reset commands on production data.
