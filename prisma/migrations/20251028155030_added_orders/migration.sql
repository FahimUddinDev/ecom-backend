/*
  Warnings:

  - You are about to alter the column `images` on the `product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `tags` on the `product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `productId` INTEGER NULL;

-- AlterTable
ALTER TABLE `product` MODIFY `images` JSON NOT NULL,
    MODIFY `tags` JSON NOT NULL;

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
