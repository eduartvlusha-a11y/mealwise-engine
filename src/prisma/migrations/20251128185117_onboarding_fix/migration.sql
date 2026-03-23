/*
  Warnings:

  - You are about to drop the column `activityLevel` on the `Onboarding` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `Onboarding` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Onboarding` table. All the data in the column will be lost.
  - You are about to drop the column `dietaryPreferences` on the `Onboarding` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Onboarding` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Onboarding` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Onboarding" DROP COLUMN "activityLevel",
DROP COLUMN "age",
DROP COLUMN "country",
DROP COLUMN "dietaryPreferences",
DROP COLUMN "gender",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "preferences" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "weight" INTEGER;
