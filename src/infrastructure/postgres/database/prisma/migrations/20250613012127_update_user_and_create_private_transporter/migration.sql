/*
  Warnings:

  - You are about to drop the column `headVillageName` on the `Village` table. All the data in the column will be lost.
  - You are about to drop the column `headVillagePhone` on the `Village` table. All the data in the column will be lost.
  - You are about to drop the column `officePhone` on the `Village` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `Village` table. All the data in the column will be lost.
  - You are about to drop the column `userVerificatorId` on the `Village` table. All the data in the column will be lost.
  - You are about to drop the column `villageEmail` on the `Village` table. All the data in the column will be lost.
  - You are about to drop the column `villageLogo` on the `Village` table. All the data in the column will be lost.
  - You are about to drop the column `villageWebsiteUrl` on the `Village` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_addressId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_loyaltyId_fkey";

-- DropForeignKey
ALTER TABLE "Village" DROP CONSTRAINT "Village_userVerificatorId_fkey";

-- AlterTable
ALTER TABLE "Transporter" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastSeen" TIMESTAMP(3),
ALTER COLUMN "password" SET DEFAULT 'warga123',
ALTER COLUMN "qrCode" DROP NOT NULL,
ALTER COLUMN "addressId" DROP NOT NULL,
ALTER COLUMN "rescheduleStatus" SET DEFAULT 'active',
ALTER COLUMN "wasteFees" DROP NOT NULL,
ALTER COLUMN "loyaltyId" DROP NOT NULL,
ALTER COLUMN "accountStatus" SET DEFAULT 'active';

-- AlterTable
ALTER TABLE "Village" DROP COLUMN "headVillageName",
DROP COLUMN "headVillagePhone",
DROP COLUMN "officePhone",
DROP COLUMN "street",
DROP COLUMN "userVerificatorId",
DROP COLUMN "villageEmail",
DROP COLUMN "villageLogo",
DROP COLUMN "villageWebsiteUrl",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "description" SET DEFAULT 'desa A merupakan desa penghasil beras merah',
ALTER COLUMN "status" SET DEFAULT 'active';

-- CreateTable
CREATE TABLE "PrivateTransporter" (
    "id" TEXT NOT NULL,
    "transporterId" TEXT NOT NULL,
    "documentUrl" TEXT NOT NULL,

    CONSTRAINT "PrivateTransporter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VillageProfile" (
    "villageId" TEXT NOT NULL,
    "street" TEXT,
    "villageLogo" TEXT,
    "villageEmail" TEXT,
    "villageWebsiteUrl" TEXT,
    "officePhone" TEXT,
    "headVillagePhone" TEXT,
    "headVillageName" TEXT,

    CONSTRAINT "VillageProfile_pkey" PRIMARY KEY ("villageId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrivateTransporter_transporterId_key" ON "PrivateTransporter"("transporterId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("addressId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_loyaltyId_fkey" FOREIGN KEY ("loyaltyId") REFERENCES "Loyalty"("loyaltyId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateTransporter" ADD CONSTRAINT "PrivateTransporter_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VillageProfile" ADD CONSTRAINT "VillageProfile_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
