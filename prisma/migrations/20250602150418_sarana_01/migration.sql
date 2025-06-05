/*
  Warnings:

  - Added the required column `jenis` to the `Sarana` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Sarana` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Sarana` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `jenis` ENUM('BERNOMOR', 'TIDAK_BERNOMOR') NOT NULL,
    ADD COLUMN `stok` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
