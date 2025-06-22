/*
  Warnings:

  - You are about to drop the column `nik` on the `Pegawai` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Pegawai` DROP COLUMN `nik`,
    ADD COLUMN `nomer_induk` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Peminjaman` MODIFY `status_pengambilan` ENUM('MENUNGGU_PENGAMBILAN', 'SUDAH_MENGAMBIL', 'TERLAMBAT_MENGAMBIL', 'NULL') NOT NULL DEFAULT 'NULL',
    MODIFY `status_pengembalian` ENUM('MENUNGGU_PENGEMBALIAN', 'SUDAH_MENGEMBALIKAN', 'TERLAMBAT_MENGEMBALIKAN', 'NULL') NOT NULL DEFAULT 'NULL';
