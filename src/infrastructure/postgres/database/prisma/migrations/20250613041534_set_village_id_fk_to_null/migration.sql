-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_villageId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "villageId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;
