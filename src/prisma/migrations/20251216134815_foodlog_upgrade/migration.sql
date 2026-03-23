/*
  Warnings:

  - You are about to drop the column `food` on the `FoodLog` table. All the data in the column will be lost.
  - Added the required column `carbs` to the `FoodLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `FoodLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fat` to the `FoodLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grams` to the `FoodLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `FoodLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `protein` to the `FoodLog` table without a default value. This is not possible if the table is not empty.
  - Made the column `calories` on table `FoodLog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FoodLog" DROP COLUMN "food",
ADD COLUMN     "carbs" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "grams" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "meal" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "protein" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "templateId" TEXT,
ALTER COLUMN "calories" SET NOT NULL;

-- CreateIndex
CREATE INDEX "FoodLog_userId_date_idx" ON "FoodLog"("userId", "date");
