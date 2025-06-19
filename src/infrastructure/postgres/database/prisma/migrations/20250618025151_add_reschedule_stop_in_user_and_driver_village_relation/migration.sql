-- AlterTable
ALTER TABLE "User" ADD COLUMN     "driverVillageId" TEXT,
ADD COLUMN     "rescheduleStopAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_driverVillageId_fkey" FOREIGN KEY ("driverVillageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;
