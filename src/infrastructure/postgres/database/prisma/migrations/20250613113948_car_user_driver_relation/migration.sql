/*
  Warnings:

  - A unique constraint covering the columns `[driverId]` on the table `Car` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `driverId` to the `Car` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "CarStatus" ADD VALUE 'idle';

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "driverId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Car_driverId_key" ON "Car"("driverId");

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
