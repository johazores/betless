# Legacy Database Repair Notice

This project now uses a fresh baseline migration for development and demo environments.

If your database has migration drift from an older Betless build, use the reset flow instead of trying to repair old anonymous vault rows:

```bash
npm run db:reset:force
npm run prisma:generate
npm run dev
```

This deletes development data and recreates the full current schema, including Clerk account ownership and proof receipts.

For production data, do not reset. Use a staged migration plan instead:

1. Add new owner columns as nullable.
2. Backfill every existing row.
3. Add foreign keys and indexes.
4. Enforce `NOT NULL` only after verification.

The MVP/demo environment is intentionally resettable because it does not contain production user data.
