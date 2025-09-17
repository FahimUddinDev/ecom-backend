/*
  Warnings:

  - A unique constraint covering the columns `[name,categoryId]` on the table `SubCategories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `SubCategories_name_categoryId_key` ON `SubCategories`(`name`, `categoryId`);
