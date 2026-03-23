/*
  Warnings:

  - You are about to alter the column `height` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `weight` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "activityLevel" TEXT,
ADD COLUMN     "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "bodyType" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currency" TEXT DEFAULT 'EUR',
ADD COLUMN     "diet" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "goal" TEXT,
ADD COLUMN     "trainsRegularly" BOOLEAN DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "weeklyBudget" INTEGER,
ALTER COLUMN "height" SET DATA TYPE INTEGER,
ALTER COLUMN "weight" SET DATA TYPE INTEGER;
