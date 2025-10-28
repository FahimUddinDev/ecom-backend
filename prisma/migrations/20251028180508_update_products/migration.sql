/*
  Warnings:

  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `additionalinfo` DROP FOREIGN KEY `AdditionalInfo_productId_fkey`;

-- DropForeignKey
ALTER TABLE `coupononproduct` DROP FOREIGN KEY `CouponOnProduct_productId_fkey`;

-- DropForeignKey
ALTER TABLE `offeronproduct` DROP FOREIGN KEY `OfferOnProduct_productId_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `Orders_productId_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_childCategoryId_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_sellerId_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_subCategoryId_fkey`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_productId_fkey`;

-- DropForeignKey
ALTER TABLE `variant` DROP FOREIGN KEY `Variant_productId_fkey`;

-- DropIndex
DROP INDEX `AdditionalInfo_productId_fkey` ON `additionalinfo`;

-- DropIndex
DROP INDEX `CouponOnProduct_productId_fkey` ON `coupononproduct`;

-- DropIndex
DROP INDEX `OfferOnProduct_productId_fkey` ON `offeronproduct`;

-- DropIndex
DROP INDEX `Orders_productId_fkey` ON `orders`;

-- DropIndex
DROP INDEX `Review_productId_fkey` ON `review`;

-- DropIndex
DROP INDEX `Variant_productId_fkey` ON `variant`;

-- DropTable
DROP TABLE `products`;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `sellerId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `soldQuantity` INTEGER NOT NULL DEFAULT 0,
    `shortDescription` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `sku` VARCHAR(191) NULL,
    `stockQuantity` INTEGER NOT NULL DEFAULT 0,
    `categoryId` INTEGER NOT NULL,
    `subCategoryId` INTEGER NOT NULL,
    `childCategoryId` INTEGER NOT NULL,
    `hasVariants` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('active', 'inactive', 'draft') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `images` JSON NOT NULL,
    `thumbnail` VARCHAR(191) NOT NULL,
    `tags` JSON NOT NULL,
    `popularity` INTEGER NOT NULL DEFAULT 0,
    `trendingScore` INTEGER NOT NULL DEFAULT 0,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `averageRating` DOUBLE NULL DEFAULT 0,

    UNIQUE INDEX `Product_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `SubCategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_childCategoryId_fkey` FOREIGN KEY (`childCategoryId`) REFERENCES `ChildCategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdditionalInfo` ADD CONSTRAINT `AdditionalInfo_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Variant` ADD CONSTRAINT `Variant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfferOnProduct` ADD CONSTRAINT `OfferOnProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponOnProduct` ADD CONSTRAINT `CouponOnProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
