/*
  Warnings:

  - Made the column `deliveryAddressId` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pickupAddressId` on table `orders` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `Orders_deliveryAddressId_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `Orders_pickupAddressId_fkey`;

-- DropIndex
DROP INDEX `Orders_deliveryAddressId_fkey` ON `orders`;

-- DropIndex
DROP INDEX `Orders_pickupAddressId_fkey` ON `orders`;

-- AlterTable
ALTER TABLE `address` ADD COLUMN `status` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `orders` MODIFY `deliveryAddressId` INTEGER NOT NULL,
    MODIFY `pickupAddressId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_deliveryAddressId_fkey` FOREIGN KEY (`deliveryAddressId`) REFERENCES `Address`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_pickupAddressId_fkey` FOREIGN KEY (`pickupAddressId`) REFERENCES `Address`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
