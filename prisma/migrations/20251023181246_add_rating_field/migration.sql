/*
  Warnings:

  - You are about to drop the column `ShortDescription` on the `product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Product_sku_key` ON `product`;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `ShortDescription`,
    ADD COLUMN `averageRating` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `popularity` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `shortDescription` VARCHAR(191) NULL,
    ADD COLUMN `trendingScore` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `viewCount` INTEGER NOT NULL DEFAULT 0;
