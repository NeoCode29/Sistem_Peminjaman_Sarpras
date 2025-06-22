-- AlterTable
ALTER TABLE `User` ADD COLUMN `due_blocked` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `Peminjaman` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `ukm` VARCHAR(191) NULL,
    `status_peminjaman` ENUM('DIBATALKAN', 'DALAM_PROSES', 'DITERIMA', 'SELESAI', 'DITOLAK') NOT NULL DEFAULT 'DALAM_PROSES',
    `status_pengajuan` ENUM('PENGAJUAN_DITERIMA', 'PENGAJUAN_DITOLAK', 'MENUNGGU_PENINJAUAN', 'DIBATALKAN') NOT NULL DEFAULT 'MENUNGGU_PENINJAUAN',
    `status_pengambilan` ENUM('MENUNGGU_PENGAMBILAN', 'SUDAH_MENGAMBIL', 'TERLAMBAT_MENGAMBIL', 'NULL') NOT NULL DEFAULT 'NULL',
    `status_pengembalian` ENUM('MENUNGGU_PENGEMBALIAN', 'SUDAH_MENGEMBALIKAN', 'TERLAMBAT_MENGEMBALIKAN', 'NULL') NOT NULL DEFAULT 'NULL',
    `tanggal_pengajuan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tanggal_pengambilan` DATETIME(3) NULL,
    `tanggal_pengembalian` DATETIME(3) NULL,
    `nama_acara` VARCHAR(191) NOT NULL,
    `jumlah_peserta` INTEGER NULL,
    `tanggal_acara_dimulai` DATETIME(3) NULL,
    `tanggal_acara_berakhir` DATETIME(3) NULL,
    `deskripsi_acara` VARCHAR(191) NULL DEFAULT '',
    `url_surat_pengajuan` VARCHAR(191) NULL,
    `sarpras_peminjaman` ENUM('PRASARANA', 'SARANA', 'BOTH') NOT NULL DEFAULT 'BOTH',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PeminjamanPrasarana` (
    `id` VARCHAR(191) NOT NULL,
    `peminjamanId` VARCHAR(191) NOT NULL,
    `prasaranaId` VARCHAR(191) NOT NULL,
    `sudah_ambil` BOOLEAN NOT NULL DEFAULT false,
    `sudah_kembali` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PeminjamanSarana` (
    `id` VARCHAR(191) NOT NULL,
    `peminjamanId` VARCHAR(191) NOT NULL,
    `saranaId` VARCHAR(191) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `sudah_dipinjam` BOOLEAN NOT NULL DEFAULT false,
    `sudah_ambil` BOOLEAN NOT NULL DEFAULT false,
    `sudah_kembali` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PeminjamanSaranaDetail` (
    `id` VARCHAR(191) NOT NULL,
    `peminjamanSaranaId` VARCHAR(191) NOT NULL,
    `nama_barang` VARCHAR(191) NOT NULL,
    `satuan` VARCHAR(191) NOT NULL,
    `sudah_ambil` BOOLEAN NOT NULL DEFAULT false,
    `sudah_kembali` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogAplikasi` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `log` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pengaturan` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `nilai` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Peminjaman` ADD CONSTRAINT `Peminjaman_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PeminjamanPrasarana` ADD CONSTRAINT `PeminjamanPrasarana_peminjamanId_fkey` FOREIGN KEY (`peminjamanId`) REFERENCES `Peminjaman`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PeminjamanPrasarana` ADD CONSTRAINT `PeminjamanPrasarana_prasaranaId_fkey` FOREIGN KEY (`prasaranaId`) REFERENCES `Prasarana`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PeminjamanSarana` ADD CONSTRAINT `PeminjamanSarana_peminjamanId_fkey` FOREIGN KEY (`peminjamanId`) REFERENCES `Peminjaman`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PeminjamanSarana` ADD CONSTRAINT `PeminjamanSarana_saranaId_fkey` FOREIGN KEY (`saranaId`) REFERENCES `Sarana`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PeminjamanSaranaDetail` ADD CONSTRAINT `PeminjamanSaranaDetail_peminjamanSaranaId_fkey` FOREIGN KEY (`peminjamanSaranaId`) REFERENCES `PeminjamanSarana`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogAplikasi` ADD CONSTRAINT `LogAplikasi_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
