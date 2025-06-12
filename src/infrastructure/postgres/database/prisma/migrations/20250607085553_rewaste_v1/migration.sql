-- CreateEnum
CREATE TYPE "RescheduleStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "PickupStatus" AS ENUM ('attached', 'processed', 'finished');

-- CreateEnum
CREATE TYPE "CarStatus" AS ENUM ('operate', 'maintenance');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('paid', 'unpaid', 'late');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('bank', 'QRIS', 'WA');

-- CreateEnum
CREATE TYPE "RatingScore" AS ENUM ('1', '2', '3', '4', '5');

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "simNo" TEXT,
    "qrCode" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "rescheduleStatus" "RescheduleStatus" NOT NULL,
    "transporterId" TEXT,
    "villageId" TEXT NOT NULL,
    "wasteFees" TEXT NOT NULL,
    "loyaltyId" TEXT NOT NULL,
    "accountStatus" "AccountStatus" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "addressId" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "lat" TEXT NOT NULL,
    "lng" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("addressId")
);

-- CreateTable
CREATE TABLE "Point" (
    "pointId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lifetimePoint" DOUBLE PRECISION NOT NULL,
    "remainPoint" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Point_pkey" PRIMARY KEY ("pointId")
);

-- CreateTable
CREATE TABLE "TrashType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TrashType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trash" (
    "id" TEXT NOT NULL,
    "pickupAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "pickupRateTime" DOUBLE PRECISION NOT NULL,
    "pickupStatus" "PickupStatus" NOT NULL,
    "point" DOUBLE PRECISION NOT NULL,
    "verifyStatus" BOOLEAN NOT NULL,
    "userDriverId" TEXT NOT NULL,
    "userCitizenId" TEXT NOT NULL,
    "rescheduleNote" TEXT,

    CONSTRAINT "Trash_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "carStatus" "CarStatus" NOT NULL,
    "year" INTEGER NOT NULL,
    "merk" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "platNo" TEXT NOT NULL,
    "transporterId" TEXT NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transporter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leaderFullname" TEXT NOT NULL,
    "emailTransporter" TEXT NOT NULL,

    CONSTRAINT "Transporter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "nominal" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paidAt" TIMESTAMP(3),
    "deadlineAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "transporterId" TEXT NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Village" (
    "id" TEXT NOT NULL,
    "villageLogo" TEXT NOT NULL,
    "villageEmail" TEXT NOT NULL,
    "villageName" TEXT NOT NULL,
    "villageWebsiteUrl" TEXT NOT NULL,
    "officePhone" TEXT NOT NULL,
    "headVillagePhone" TEXT NOT NULL,
    "headVillageName" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "regency" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL,
    "userVerificatorId" TEXT NOT NULL,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BBMHistory" (
    "id" TEXT NOT NULL,
    "evidenceUrl" TEXT NOT NULL,
    "totalLiter" DOUBLE PRECISION NOT NULL,
    "createdAt" TEXT NOT NULL,
    "kilometerAt" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "carId" TEXT NOT NULL,

    CONSTRAINT "BBMHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceHistory" (
    "id" TEXT NOT NULL,
    "lastMaintainAt" TIMESTAMP(3) NOT NULL,
    "nextMaintainAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "maintainPrice" DOUBLE PRECISION NOT NULL,
    "carId" TEXT NOT NULL,

    CONSTRAINT "MaintenanceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loyalty" (
    "loyaltyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minimumPoint" DOUBLE PRECISION NOT NULL,
    "maximumPoint" TEXT NOT NULL,

    CONSTRAINT "Loyalty_pkey" PRIMARY KEY ("loyaltyId")
);

-- CreateTable
CREATE TABLE "LoyaltyBenefit" (
    "benefitCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "LoyaltyBenefit_pkey" PRIMARY KEY ("benefitCode")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "verificatorUserId" TEXT NOT NULL,
    "trashId" TEXT NOT NULL,
    "verifyRateTime" DOUBLE PRECISION NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationBadge" (
    "id" TEXT NOT NULL,
    "badgeName" TEXT NOT NULL,
    "badgeDescription" TEXT NOT NULL,

    CONSTRAINT "VerificationBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "point" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificatorVerificationBadges" (
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificatorVerificationBadges_pkey" PRIMARY KEY ("userId","badgeId")
);

-- CreateTable
CREATE TABLE "TransporterVillage" (
    "transporterId" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,

    CONSTRAINT "TransporterVillage_pkey" PRIMARY KEY ("transporterId","villageId")
);

-- CreateTable
CREATE TABLE "UserRoles" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRoles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "TrashHasTrashType" (
    "trashId" TEXT NOT NULL,
    "trashTypeId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "verificationStatus" BOOLEAN NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "TrashHasTrashType_pkey" PRIMARY KEY ("trashId","trashTypeId")
);

-- CreateTable
CREATE TABLE "CitizenReward" (
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "pointRequired" DOUBLE PRECISION NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "CitizenReward_pkey" PRIMARY KEY ("userId","rewardId")
);

-- CreateTable
CREATE TABLE "DriverRating" (
    "userDriverId" TEXT NOT NULL,
    "userCitizenId" TEXT NOT NULL,
    "ratingScore" "RatingScore" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverRating_pkey" PRIMARY KEY ("userDriverId","userCitizenId")
);

-- CreateTable
CREATE TABLE "_LoyaltyToLoyaltyBenefit" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LoyaltyToLoyaltyBenefit_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Point_userId_key" ON "Point"("userId");

-- CreateIndex
CREATE INDEX "_LoyaltyToLoyaltyBenefit_B_index" ON "_LoyaltyToLoyaltyBenefit"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("addressId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_loyaltyId_fkey" FOREIGN KEY ("loyaltyId") REFERENCES "Loyalty"("loyaltyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Point" ADD CONSTRAINT "Point_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trash" ADD CONSTRAINT "Trash_userDriverId_fkey" FOREIGN KEY ("userDriverId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trash" ADD CONSTRAINT "Trash_userCitizenId_fkey" FOREIGN KEY ("userCitizenId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_userVerificatorId_fkey" FOREIGN KEY ("userVerificatorId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BBMHistory" ADD CONSTRAINT "BBMHistory_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceHistory" ADD CONSTRAINT "MaintenanceHistory_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_verificatorUserId_fkey" FOREIGN KEY ("verificatorUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_trashId_fkey" FOREIGN KEY ("trashId") REFERENCES "Trash"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificatorVerificationBadges" ADD CONSTRAINT "VerificatorVerificationBadges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificatorVerificationBadges" ADD CONSTRAINT "VerificatorVerificationBadges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "VerificationBadge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransporterVillage" ADD CONSTRAINT "TransporterVillage_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransporterVillage" ADD CONSTRAINT "TransporterVillage_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoles" ADD CONSTRAINT "UserRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoles" ADD CONSTRAINT "UserRoles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrashHasTrashType" ADD CONSTRAINT "TrashHasTrashType_trashId_fkey" FOREIGN KEY ("trashId") REFERENCES "Trash"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrashHasTrashType" ADD CONSTRAINT "TrashHasTrashType_trashTypeId_fkey" FOREIGN KEY ("trashTypeId") REFERENCES "TrashType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenReward" ADD CONSTRAINT "CitizenReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenReward" ADD CONSTRAINT "CitizenReward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverRating" ADD CONSTRAINT "DriverRating_userDriverId_fkey" FOREIGN KEY ("userDriverId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverRating" ADD CONSTRAINT "DriverRating_userCitizenId_fkey" FOREIGN KEY ("userCitizenId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LoyaltyToLoyaltyBenefit" ADD CONSTRAINT "_LoyaltyToLoyaltyBenefit_A_fkey" FOREIGN KEY ("A") REFERENCES "Loyalty"("loyaltyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LoyaltyToLoyaltyBenefit" ADD CONSTRAINT "_LoyaltyToLoyaltyBenefit_B_fkey" FOREIGN KEY ("B") REFERENCES "LoyaltyBenefit"("benefitCode") ON DELETE CASCADE ON UPDATE CASCADE;
