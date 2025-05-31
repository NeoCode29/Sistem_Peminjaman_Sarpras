/*
  Warnings:

  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Authenticator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mahasiswa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pegawai` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PermissionToRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Account` DROP FOREIGN KEY `Account_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Authenticator` DROP FOREIGN KEY `Authenticator_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Mahasiswa` DROP FOREIGN KEY `Mahasiswa_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Pegawai` DROP FOREIGN KEY `Pegawai_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_userId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `_PermissionToRole` DROP FOREIGN KEY `_PermissionToRole_A_fkey`;

-- DropForeignKey
ALTER TABLE `_PermissionToRole` DROP FOREIGN KEY `_PermissionToRole_B_fkey`;

-- DropForeignKey
ALTER TABLE `admin` DROP FOREIGN KEY `admin_userId_fkey`;

-- DropIndex
DROP INDEX `Account_userId_key` ON `Account`;

-- DropIndex
DROP INDEX `User_roleId_fkey` ON `User`;

-- DropIndex
DROP INDEX `User_username_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `roleId`,
    DROP COLUMN `username`,
    ADD COLUMN `jurusan` VARCHAR(191) NULL,
    ADD COLUMN `nik` VARCHAR(191) NULL,
    ADD COLUMN `nim` VARCHAR(191) NULL,
    ADD COLUMN `prodi` VARCHAR(191) NULL,
    ADD COLUMN `unit` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `Authenticator`;

-- DropTable
DROP TABLE `Mahasiswa`;

-- DropTable
DROP TABLE `Pegawai`;

-- DropTable
DROP TABLE `Permission`;

-- DropTable
DROP TABLE `Role`;

-- DropTable
DROP TABLE `_PermissionToRole`;

-- DropTable
DROP TABLE `admin`;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
