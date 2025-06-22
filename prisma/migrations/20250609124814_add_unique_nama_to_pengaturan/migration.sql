/*
  Warnings:

  - A unique constraint covering the columns `[nama]` on the table `Pengaturan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Peminjaman` MODIFY `status_pengambilan` ENUM('MENUNGGU_PENGAMBILAN', 'SUDAH_MENGAMBIL', 'TERLAMBAT_MENGAMBIL', 'NULL') NOT NULL DEFAULT 'NULL',
    MODIFY `status_pengembalian` ENUM('MENUNGGU_PENGEMBALIAN', 'SUDAH_MENGEMBALIKAN', 'TERLAMBAT_MENGEMBALIKAN', 'NULL') NOT NULL DEFAULT 'NULL';

-- CreateIndex
CREATE UNIQUE INDEX `Pengaturan_nama_key` ON `Pengaturan`(`nama`);
