/*
  Warnings:

  - Made the column `categoryId` on table `product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `childCategoryId` on table `product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subCategoryId` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `product` MODIFY `categoryId` INTEGER NOT NULL,
    MODIFY `childCategoryId` INTEGER NOT NULL,
    MODIFY `subCategoryId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `SubCategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_childCategoryId_fkey` FOREIGN KEY (`childCategoryId`) REFERENCES `ChildCategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
