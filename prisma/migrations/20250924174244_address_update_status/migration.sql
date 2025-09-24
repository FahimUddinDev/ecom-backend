-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `Orders_deliveryAddressId_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `Orders_pickupAddressId_fkey`;

-- DropIndex
DROP INDEX `Orders_deliveryAddressId_fkey` ON `orders`;

-- DropIndex
DROP INDEX `Orders_pickupAddressId_fkey` ON `orders`;

-- AlterTable
ALTER TABLE `orders` MODIFY `deliveryAddressId` INTEGER NULL,
    MODIFY `pickupAddressId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_deliveryAddressId_fkey` FOREIGN KEY (`deliveryAddressId`) REFERENCES `Address`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_pickupAddressId_fkey` FOREIGN KEY (`pickupAddressId`) REFERENCES `Address`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
