/*
  Warnings:

  - You are about to drop the column `barangId` on the `pengambilan` table. All the data in the column will be lost.
  - You are about to drop the column `fotoUrl` on the `pengambilan` table. All the data in the column will be lost.
  - You are about to drop the column `jumlah` on the `pengambilan` table. All the data in the column will be lost.
  - You are about to drop the column `barangId` on the `pengembalian` table. All the data in the column will be lost.
  - You are about to drop the column `fotoUrl` on the `pengembalian` table. All the data in the column will be lost.
  - You are about to drop the column `jumlah` on the `pengembalian` table. All the data in the column will be lost.
  - You are about to drop the column `kondisi` on the `pengembalian` table. All the data in the column will be lost.
  - You are about to drop the column `barangId` on the `penurunan` table. All the data in the column will be lost.
  - You are about to drop the column `fotoUrl` on the `penurunan` table. All the data in the column will be lost.
  - You are about to drop the column `jumlah` on the `penurunan` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `pengambilan` DROP FOREIGN KEY `pengambilan_barangId_fkey`;

-- DropForeignKey
ALTER TABLE `pengembalian` DROP FOREIGN KEY `pengembalian_barangId_fkey`;

-- DropForeignKey
ALTER TABLE `penurunan` DROP FOREIGN KEY `penurunan_barangId_fkey`;

-- DropIndex
DROP INDEX `pengambilan_barangId_fkey` ON `pengambilan`;

-- DropIndex
DROP INDEX `pengembalian_barangId_fkey` ON `pengembalian`;

-- DropIndex
DROP INDEX `penurunan_barangId_fkey` ON `penurunan`;

-- AlterTable
ALTER TABLE `pengambilan` DROP COLUMN `barangId`,
    DROP COLUMN `fotoUrl`,
    DROP COLUMN `jumlah`;

-- AlterTable
ALTER TABLE `pengembalian` DROP COLUMN `barangId`,
    DROP COLUMN `fotoUrl`,
    DROP COLUMN `jumlah`,
    DROP COLUMN `kondisi`;

-- AlterTable
ALTER TABLE `penurunan` DROP COLUMN `barangId`,
    DROP COLUMN `fotoUrl`,
    DROP COLUMN `jumlah`;

-- CreateTable
CREATE TABLE `pengambilan_item` (
    `id` VARCHAR(191) NOT NULL,
    `pengambilanId` VARCHAR(191) NOT NULL,
    `barangId` VARCHAR(191) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `fotoUrl` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penurunan_item` (
    `id` VARCHAR(191) NOT NULL,
    `penurunanId` VARCHAR(191) NOT NULL,
    `barangId` VARCHAR(191) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `fotoUrl` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengembalian_item` (
    `id` VARCHAR(191) NOT NULL,
    `pengembalianId` VARCHAR(191) NOT NULL,
    `barangId` VARCHAR(191) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `kondisi` ENUM('BAIK', 'RUSAK') NOT NULL,
    `fotoUrl` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pengambilan_item` ADD CONSTRAINT `pengambilan_item_pengambilanId_fkey` FOREIGN KEY (`pengambilanId`) REFERENCES `pengambilan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pengambilan_item` ADD CONSTRAINT `pengambilan_item_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `barang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penurunan_item` ADD CONSTRAINT `penurunan_item_penurunanId_fkey` FOREIGN KEY (`penurunanId`) REFERENCES `penurunan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penurunan_item` ADD CONSTRAINT `penurunan_item_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `barang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pengembalian_item` ADD CONSTRAINT `pengembalian_item_pengembalianId_fkey` FOREIGN KEY (`pengembalianId`) REFERENCES `pengembalian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pengembalian_item` ADD CONSTRAINT `pengembalian_item_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `barang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
