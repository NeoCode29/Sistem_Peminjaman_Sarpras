/*
  Warnings:

  - You are about to drop the column `total_stok` on the `Sarana` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Sarana` DROP COLUMN `total_stok`,
    ADD COLUMN `sisa` INTEGER NOT NULL DEFAULT 0;
