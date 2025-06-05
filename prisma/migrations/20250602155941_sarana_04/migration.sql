/*
  Warnings:

  - You are about to drop the column `image_url` on the `DetailSarana` table. All the data in the column will be lost.
  - You are about to drop the column `keterangan` on the `DetailSarana` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `DetailSarana` DROP COLUMN `image_url`,
    DROP COLUMN `keterangan`;

-- AlterTable
ALTER TABLE `Sarana` ADD COLUMN `image_url` VARCHAR(191) NULL,
    ADD COLUMN `total_stok` INTEGER NOT NULL DEFAULT 0;
