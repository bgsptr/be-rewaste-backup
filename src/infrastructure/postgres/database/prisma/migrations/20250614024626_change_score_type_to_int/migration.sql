/*
  Warnings:

  - Changed the type of `ratingScore` on the `DriverRating` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "DriverRating" DROP COLUMN "ratingScore",
ADD COLUMN     "ratingScore" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "RatingScore";
