/*
  Warnings:

  - The values [draft,requested,scheduled,in_progress] on the enum `PickupStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `pickupAt` on the `Trash` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[trashId]` on the table `Verification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `spbuName` to the `BBMHistory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JoinStatus" AS ENUM ('Pending', 'Accepted', 'Rejected');

-- AlterEnum
BEGIN;
CREATE TYPE "PickupStatus_new" AS ENUM ('generated', 'assigned', 'acknowledged', 'verifying', 'completed', 'cancelled');
ALTER TABLE "Trash" ALTER COLUMN "pickupStatus" TYPE "PickupStatus_new" USING ("pickupStatus"::text::"PickupStatus_new");
ALTER TYPE "PickupStatus" RENAME TO "PickupStatus_old";
ALTER TYPE "PickupStatus_new" RENAME TO "PickupStatus";
DROP TYPE "PickupStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "BBMHistory" ADD COLUMN     "spbuName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TransporterVillage" ADD COLUMN     "joinStatus" "JoinStatus" NOT NULL DEFAULT 'Pending',
ADD COLUMN     "linkedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Trash" DROP COLUMN "pickupAt",
ADD COLUMN     "actualPickupAt" TIMESTAMP(3),
ADD COLUMN     "estimatePickupAt" TIMESTAMP(3),
ADD COLUMN     "pickupRange" DOUBLE PRECISION,
ADD COLUMN     "timeNeededInSecond" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Verification_trashId_key" ON "Verification"("trashId");
