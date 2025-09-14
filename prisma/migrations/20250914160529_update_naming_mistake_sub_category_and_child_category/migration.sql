/*
  Warnings:

  - You are about to drop the column `categoryId` on the `childcategories` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `childcategories` DROP FOREIGN KEY `ChildCategories_categoryId_fkey`;

-- DropIndex
DROP INDEX `ChildCategories_categoryId_fkey` ON `childcategories`;

-- AlterTable
ALTER TABLE `childcategories` DROP COLUMN `categoryId`;
