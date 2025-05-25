-- AlterTable
ALTER TABLE `User` ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `number_phone` VARCHAR(191) NULL,
    ADD COLUMN `position` VARCHAR(191) NULL;

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
    `nip` VARCHAR(191) NULL,
    `unit_pegawai` VARCHAR(191) NULL,

    UNIQUE INDEX `Pegawai_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
