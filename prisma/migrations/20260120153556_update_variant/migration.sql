/*
  Warnings:

  - You are about to drop the column `variantId` on the `categories` table. All the data in the column will be lost.
  - Added the required column `thumbnail` to the `Variant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `categories` DROP FOREIGN KEY `Categories_variantId_fkey`;

-- DropIndex
DROP INDEX `Categories_variantId_fkey` ON `categories`;

-- AlterTable
ALTER TABLE `categories` DROP COLUMN `variantId`;

-- AlterTable
ALTER TABLE `variant` ADD COLUMN `thumbnail` VARCHAR(191) NOT NULL;
