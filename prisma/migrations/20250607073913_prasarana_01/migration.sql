-- CreateTable
CREATE TABLE `Prasarana` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `lokasi` VARCHAR(191) NULL,
    `kapasitas` INTEGER NULL,
    `deskripsi` VARCHAR(191) NULL,
    `kondisi` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImagePrasarana` (
    `id` VARCHAR(191) NOT NULL,
    `prasaranaId` VARCHAR(191) NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ImagePrasarana` ADD CONSTRAINT `ImagePrasarana_prasaranaId_fkey` FOREIGN KEY (`prasaranaId`) REFERENCES `Prasarana`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
