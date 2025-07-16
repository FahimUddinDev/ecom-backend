/*
  Warnings:

  - Made the column `createdAt` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `verified` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `role` ENUM('USER', 'ADMIN', 'MODERATOR') NOT NULL DEFAULT 'USER',
    MODIFY `status` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `verified` BOOLEAN NOT NULL DEFAULT false;
