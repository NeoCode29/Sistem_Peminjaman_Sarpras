/*
  Warnings:

  - You are about to drop the column `ukm` on the `Peminjaman` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Peminjaman` DROP COLUMN `ukm`,
    ADD COLUMN `ormawa` VARCHAR(191) NULL,
    ADD COLUMN `unit_pegawai` VARCHAR(191) NULL,
    MODIFY `status_pengambilan` ENUM('MENUNGGU_PENGAMBILAN', 'SUDAH_MENGAMBIL', 'TERLAMBAT_MENGAMBIL', 'NULL') NOT NULL DEFAULT 'NULL',
    MODIFY `status_pengembalian` ENUM('MENUNGGU_PENGEMBALIAN', 'SUDAH_MENGEMBALIKAN', 'TERLAMBAT_MENGEMBALIKAN', 'NULL') NOT NULL DEFAULT 'NULL';
