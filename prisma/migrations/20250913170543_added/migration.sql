/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `categories` ADD COLUMN `thumbnail` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `childcategories` ADD COLUMN `thumbnail` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `subcategories` ADD COLUMN `thumbnail` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Categories_name_key` ON `Categories`(`name`);
