/*
  Warnings:

  - You are about to alter the column `images` on the `variant` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `variant` MODIFY `images` JSON NOT NULL;
