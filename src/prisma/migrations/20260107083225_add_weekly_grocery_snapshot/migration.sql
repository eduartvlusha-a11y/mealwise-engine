-- CreateTable
CREATE TABLE "WeeklyGrocerySnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekKey" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyGrocerySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklyGrocerySnapshot_userId_weekKey_idx" ON "WeeklyGrocerySnapshot"("userId", "weekKey");

-- AddForeignKey
ALTER TABLE "WeeklyGrocerySnapshot" ADD CONSTRAINT "WeeklyGrocerySnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
