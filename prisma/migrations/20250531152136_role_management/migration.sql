/*
  Warnings:

  - You are about to drop the column `jurusan` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nik` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nim` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `prodi` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `jurusan`,
    DROP COLUMN `nik`,
    DROP COLUMN `nim`,
    DROP COLUMN `prodi`,
    DROP COLUMN `unit`;

-- CreateTable
CREATE TABLE `Mahasiswa` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `nim` VARCHAR(191) NULL,
    `jurusan` VARCHAR(191) NULL,
    `prodi` VARCHAR(191) NULL,

    UNIQUE INDEX `Mahasiswa_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pegawai` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `nik` VARCHAR(191) NULL,
    `unit_pegawai` VARCHAR(191) NULL,

    UNIQUE INDEX `Pegawai_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Mahasiswa` ADD CONSTRAINT `Mahasiswa_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pegawai` ADD CONSTRAINT `Pegawai_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
