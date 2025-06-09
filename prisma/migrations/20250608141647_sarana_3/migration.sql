/*
  Warnings:

  - You are about to drop the column `kondisi` on the `Prasarana` table. All the data in the column will be lost.
  - You are about to drop the column `kategori` on the `Sarana` table. All the data in the column will be lost.
  - You are about to drop the column `satuan` on the `Sarana` table. All the data in the column will be lost.
  - You are about to drop the column `total_stok` on the `Sarana` table. All the data in the column will be lost.
  - You are about to drop the column `deskripsi` on the `Satuan` table. All the data in the column will be lost.
  - Added the required column `kategoriId` to the `Sarana` table without a default value. This is not possible if the table is not empty.
  - Added the required column `satuanId` to the `Sarana` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Sarana` DROP FOREIGN KEY `Sarana_kategori_fkey`;

-- DropForeignKey
ALTER TABLE `Sarana` DROP FOREIGN KEY `Sarana_satuan_fkey`;

-- DropIndex
DROP INDEX `Sarana_kategori_fkey` ON `Sarana`;

-- DropIndex
DROP INDEX `Sarana_satuan_fkey` ON `Sarana`;

-- AlterTable
ALTER TABLE `DetailSarana` MODIFY `status` ENUM('DIPINJAM', 'TERSEDIA', 'HILANG', 'RUSAK') NOT NULL DEFAULT 'TERSEDIA';

-- AlterTable
ALTER TABLE `Prasarana` DROP COLUMN `kondisi`,
    MODIFY `status` ENUM('DIPINJAM', 'TERSEDIA', 'HILANG', 'RUSAK') NOT NULL DEFAULT 'TERSEDIA';

-- AlterTable
ALTER TABLE `Sarana` DROP COLUMN `kategori`,
    DROP COLUMN `satuan`,
    DROP COLUMN `total_stok`,
    ADD COLUMN `kategoriId` VARCHAR(191) NOT NULL,
    ADD COLUMN `satuanId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Satuan` DROP COLUMN `deskripsi`;

-- AddForeignKey
ALTER TABLE `Sarana` ADD CONSTRAINT `Sarana_satuanId_fkey` FOREIGN KEY (`satuanId`) REFERENCES `Satuan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sarana` ADD CONSTRAINT `Sarana_kategoriId_fkey` FOREIGN KEY (`kategoriId`) REFERENCES `KategoriSarana`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
