/*
  Warnings:

  - You are about to drop the column `username` on the `smtp` table. All the data in the column will be lost.
  - Added the required column `userName` to the `smtp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `smtp` DROP COLUMN `username`,
    ADD COLUMN `userName` VARCHAR(191) NOT NULL;
