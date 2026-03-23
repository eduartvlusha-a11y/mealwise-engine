/*
  Warnings:

  - You are about to drop the column `activity` on the `Onboarding` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Onboarding" DROP COLUMN "activity",
ADD COLUMN     "activityLevel" TEXT,
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "budget" INTEGER,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "dietaryPreferences" TEXT[],
ADD COLUMN     "gender" TEXT;
