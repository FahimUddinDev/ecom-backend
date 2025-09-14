/*
  Warnings:

  - Added the required column `document` to the `Kyc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `kyc` ADD COLUMN `document` VARCHAR(191) NOT NULL;
