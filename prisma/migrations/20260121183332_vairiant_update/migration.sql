/*
  Warnings:

  - Added the required column `sellerId` to the `Variant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `variant` ADD COLUMN `sellerId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Variant` ADD CONSTRAINT `Variant_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
