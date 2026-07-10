-- Performance indexes for analytics and admin list queries
CREATE INDEX "AppUser_createdAt_idx" ON "AppUser"("createdAt");
CREATE INDEX "AppUser_status_createdAt_idx" ON "AppUser"("status", "createdAt");
CREATE INDEX "PointsTransaction_type_createdAt_idx" ON "PointsTransaction"("type", "createdAt");
