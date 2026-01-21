-- AlterTable
ALTER TABLE `orders` ADD COLUMN `variantId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `Variant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
