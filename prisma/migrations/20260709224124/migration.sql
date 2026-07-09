-- CreateIndex
CREATE INDEX "RewardClaim_vaultId_status_weekNumber_idx" ON "RewardClaim"("vaultId", "status", "weekNumber");

-- CreateIndex
CREATE INDEX "TopUp_vaultId_status_dueAt_idx" ON "TopUp"("vaultId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "Vault_status_createdAt_idx" ON "Vault"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Vault_walletAddress_idx" ON "Vault"("walletAddress");
