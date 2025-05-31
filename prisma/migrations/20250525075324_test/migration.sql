/*
  Warnings:

  - You are about to drop the column `nip` on the `Pegawai` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Pegawai` DROP COLUMN `nip`,
    ADD COLUMN `nik` VARCHAR(191) NULL;
