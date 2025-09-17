/*
  Warnings:

  - A unique constraint covering the columns `[name,subCategoryId]` on the table `ChildCategories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ChildCategories_name_subCategoryId_key` ON `ChildCategories`(`name`, `subCategoryId`);
