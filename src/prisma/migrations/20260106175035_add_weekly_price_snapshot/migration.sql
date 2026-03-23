-- CreateTable
CREATE TABLE "WeeklyPriceSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekKey" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyPriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklyPriceSnapshot_userId_weekKey_idx" ON "WeeklyPriceSnapshot"("userId", "weekKey");

-- AddForeignKey
ALTER TABLE "WeeklyPriceSnapshot" ADD CONSTRAINT "WeeklyPriceSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
