-- Adds explicit Stellar verification fields for receipts and activity records.
-- explorerUrl points to the transaction when a transaction hash exists.
-- accountExplorerUrl points to the related Stellar account for wallet-level verification.
ALTER TABLE "ProofReceipt" ADD COLUMN IF NOT EXISTS "sourceAccount" TEXT;
ALTER TABLE "ProofReceipt" ADD COLUMN IF NOT EXISTS "destinationAccount" TEXT;
ALTER TABLE "ProofReceipt" ADD COLUMN IF NOT EXISTS "accountExplorerUrl" TEXT;

ALTER TABLE "ActivityEvent" ADD COLUMN IF NOT EXISTS "sourceAccount" TEXT;
ALTER TABLE "ActivityEvent" ADD COLUMN IF NOT EXISTS "destinationAccount" TEXT;
ALTER TABLE "ActivityEvent" ADD COLUMN IF NOT EXISTS "network" TEXT;
ALTER TABLE "ActivityEvent" ADD COLUMN IF NOT EXISTS "accountExplorerUrl" TEXT;

UPDATE "ProofReceipt"
SET
  "destinationAccount" = COALESCE("destinationAccount", "publicAddress"),
  "accountExplorerUrl" = COALESCE(
    "accountExplorerUrl",
    CASE
      WHEN lower(COALESCE("network", '')) LIKE '%main%' OR lower(COALESCE("network", '')) LIKE '%public%'
        THEN 'https://stellar.expert/explorer/public/account/' || "publicAddress"
      ELSE 'https://stellar.expert/explorer/testnet/account/' || "publicAddress"
    END
  ),
  "explorerUrl" = COALESCE(
    "explorerUrl",
    CASE
      WHEN "transactionHash" IS NOT NULL AND (lower(COALESCE("network", '')) LIKE '%main%' OR lower(COALESCE("network", '')) LIKE '%public%')
        THEN 'https://stellar.expert/explorer/public/tx/' || "transactionHash"
      WHEN "transactionHash" IS NOT NULL
        THEN 'https://stellar.expert/explorer/testnet/tx/' || "transactionHash"
      WHEN lower(COALESCE("network", '')) LIKE '%main%' OR lower(COALESCE("network", '')) LIKE '%public%'
        THEN 'https://stellar.expert/explorer/public/account/' || "publicAddress"
      ELSE 'https://stellar.expert/explorer/testnet/account/' || "publicAddress"
    END
  );

UPDATE "ActivityEvent"
SET
  "destinationAccount" = COALESCE("destinationAccount", "walletAddress"),
  "network" = COALESCE("network", CASE WHEN "rail" = 'STELLAR' THEN 'Stellar Testnet' ELSE NULL END),
  "accountExplorerUrl" = COALESCE(
    "accountExplorerUrl",
    CASE
      WHEN "walletAddress" IS NOT NULL
        THEN 'https://stellar.expert/explorer/testnet/account/' || "walletAddress"
      ELSE NULL
    END
  ),
  "explorerUrl" = COALESCE(
    "explorerUrl",
    CASE
      WHEN "transactionHash" IS NOT NULL
        THEN 'https://stellar.expert/explorer/testnet/tx/' || "transactionHash"
      WHEN "walletAddress" IS NOT NULL
        THEN 'https://stellar.expert/explorer/testnet/account/' || "walletAddress"
      ELSE NULL
    END
  );
