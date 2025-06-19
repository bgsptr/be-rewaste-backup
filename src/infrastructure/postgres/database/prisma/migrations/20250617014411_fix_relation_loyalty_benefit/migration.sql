/*
  Warnings:

  - You are about to alter the column `pointRequired` on the `CitizenReward` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `minimumPoint` on the `Loyalty` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `lifetimePoint` on the `Point` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `remainPoint` on the `Point` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `point` on the `Reward` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `point` on the `Trash` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the `_LoyaltyToLoyaltyBenefit` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `maximumPoint` on the `Loyalty` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `tierId` to the `LoyaltyBenefit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_LoyaltyToLoyaltyBenefit" DROP CONSTRAINT "_LoyaltyToLoyaltyBenefit_A_fkey";

-- DropForeignKey
ALTER TABLE "_LoyaltyToLoyaltyBenefit" DROP CONSTRAINT "_LoyaltyToLoyaltyBenefit_B_fkey";

-- AlterTable
ALTER TABLE "CitizenReward" ALTER COLUMN "pointRequired" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Loyalty" ALTER COLUMN "minimumPoint" SET DATA TYPE INTEGER,
DROP COLUMN "maximumPoint",
ADD COLUMN     "maximumPoint" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "LoyaltyBenefit" ADD COLUMN     "tierId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Point" ALTER COLUMN "lifetimePoint" SET DATA TYPE INTEGER,
ALTER COLUMN "remainPoint" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Reward" ALTER COLUMN "point" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Trash" ALTER COLUMN "point" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "rescheduleStatus" SET DEFAULT 'inactive';

-- DropTable
DROP TABLE "_LoyaltyToLoyaltyBenefit";

-- AddForeignKey
ALTER TABLE "LoyaltyBenefit" ADD CONSTRAINT "LoyaltyBenefit_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Loyalty"("loyaltyId") ON DELETE RESTRICT ON UPDATE CASCADE;
