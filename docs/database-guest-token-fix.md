# Guest Vault Token Database Fix

## Issue

If vault creation fails with this error:

```txt
Invalid `prisma.vault.create()` invocation:
The column `guestAccessTokenHash` does not exist in the current database.
```

it means the app code is newer than the database schema. The current product flow allows guests to create a vault immediately, so the `Vault` table needs the `guestAccessTokenHash` column.

## Fast Fix

Run:

```bash
npm run prisma:migrate
npm run prisma:generate
npm run dev
```

This applies the migration that adds the missing guest access token column.

## Clean Reset

For a fresh development database, run:

```bash
npm run db:reset:force
npm run prisma:generate
npm run dev
```

This deletes local development data and recreates all tables from the migrations.

## Why This Exists

Guest vault access lets a new user create a vault before signing in. The browser receives a temporary vault access token. The database stores only a hashed version of that token, never the raw token.

## Production Note

Do not manually edit the database in production. Apply migrations through the normal deployment pipeline.
