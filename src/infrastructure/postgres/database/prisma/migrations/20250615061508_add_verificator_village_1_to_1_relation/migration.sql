/*
  Warnings:

  - The values [attached,processed,finished] on the enum `PickupStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[userVerificatorId]` on the table `Village` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PickupStatus_new" AS ENUM ('draft', 'requested', 'scheduled', 'in_progress', 'completed', 'cancelled');
ALTER TABLE "Trash" ALTER COLUMN "pickupStatus" TYPE "PickupStatus_new" USING ("pickupStatus"::text::"PickupStatus_new");
ALTER TYPE "PickupStatus" RENAME TO "PickupStatus_old";
ALTER TYPE "PickupStatus_new" RENAME TO "PickupStatus";
DROP TYPE "PickupStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Trash" DROP CONSTRAINT "Trash_userDriverId_fkey";

-- AlterTable
ALTER TABLE "Trash" ALTER COLUMN "pickupAt" DROP NOT NULL,
ALTER COLUMN "pickupRateTime" DROP NOT NULL,
ALTER COLUMN "point" DROP NOT NULL,
ALTER COLUMN "userDriverId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Village" ADD COLUMN     "userVerificatorId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Village_userVerificatorId_key" ON "Village"("userVerificatorId");

-- AddForeignKey
ALTER TABLE "Trash" ADD CONSTRAINT "Trash_userDriverId_fkey" FOREIGN KEY ("userDriverId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_userVerificatorId_fkey" FOREIGN KEY ("userVerificatorId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
