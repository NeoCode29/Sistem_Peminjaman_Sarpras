/*
  Warnings:

  - You are about to drop the column `kondisi` on the `DetailSarana` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `DetailSarana` DROP COLUMN `kondisi`,
    ADD COLUMN `status` ENUM('DIPINJAM', 'TERSEDIA') NOT NULL DEFAULT 'TERSEDIA';
