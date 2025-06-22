/*
  Warnings:

  - You are about to alter the column `status_pengembalian` on the `Peminjaman` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `Enum(EnumId(8))`.

*/
-- AlterTable
ALTER TABLE `Peminjaman` MODIFY `status_pengambilan` ENUM('MENUNGGU_PENGAMBILAN', 'SUDAH_MENGAMBIL', 'TERLAMBAT_MENGAMBIL', 'NULL') NOT NULL DEFAULT 'NULL',
    MODIFY `status_pengembalian` ENUM('MENUNGGU_PENGEMBALIAN', 'MENUNGGU_VALIDASI', 'SUDAH_MENGEMBALIKAN', 'TERLAMBAT_MENGEMBALIKAN', 'NULL') NOT NULL DEFAULT 'NULL';
