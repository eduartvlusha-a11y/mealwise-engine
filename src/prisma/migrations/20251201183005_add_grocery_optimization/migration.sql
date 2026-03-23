-- CreateTable
CREATE TABLE "GroceryOptimization" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "country" TEXT,
    "currency" TEXT,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ai-grocery',
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroceryOptimization_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GroceryOptimization" ADD CONSTRAINT "GroceryOptimization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
