-- CreateTable
CREATE TABLE `KategoriSarana` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `KategoriSarana_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Satuan` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `singkatan` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Satuan_nama_key`(`nama`),
    UNIQUE INDEX `Satuan_singkatan_key`(`singkatan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sarana` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `satuan` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetailSarana` (
    `id` VARCHAR(191) NOT NULL,
    `saranaId` VARCHAR(191) NOT NULL,
    `kondisi` VARCHAR(191) NOT NULL,
    `lokasi` VARCHAR(191) NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DetailSarana_saranaId_idx`(`saranaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Sarana` ADD CONSTRAINT `Sarana_satuan_fkey` FOREIGN KEY (`satuan`) REFERENCES `Satuan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sarana` ADD CONSTRAINT `Sarana_kategori_fkey` FOREIGN KEY (`kategori`) REFERENCES `KategoriSarana`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailSarana` ADD CONSTRAINT `DetailSarana_saranaId_fkey` FOREIGN KEY (`saranaId`) REFERENCES `Sarana`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
