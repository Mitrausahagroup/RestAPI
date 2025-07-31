/*
  Warnings:

  - You are about to drop the column `varian` on the `barang` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `pengambilan` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `pengambilan` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `pengembalian` table. All the data in the column will be lost.
  - You are about to drop the `pengambilan_item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pengembalian_item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `penurunan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `penurunan_item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `salesId` to the `Pengambilan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salesId` to the `Pengembalian` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `pengambilan` DROP FOREIGN KEY `pengambilan_userId_fkey`;

-- DropForeignKey
ALTER TABLE `pengambilan_item` DROP FOREIGN KEY `pengambilan_item_barangId_fkey`;

-- DropForeignKey
ALTER TABLE `pengambilan_item` DROP FOREIGN KEY `pengambilan_item_pengambilanId_fkey`;

-- DropForeignKey
ALTER TABLE `pengembalian` DROP FOREIGN KEY `pengembalian_userId_fkey`;

-- DropForeignKey
ALTER TABLE `pengembalian_item` DROP FOREIGN KEY `pengembalian_item_barangId_fkey`;

-- DropForeignKey
ALTER TABLE `pengembalian_item` DROP FOREIGN KEY `pengembalian_item_pengembalianId_fkey`;

-- DropForeignKey
ALTER TABLE `penurunan` DROP FOREIGN KEY `penurunan_userId_fkey`;

-- DropForeignKey
ALTER TABLE `penurunan_item` DROP FOREIGN KEY `penurunan_item_barangId_fkey`;

-- DropForeignKey
ALTER TABLE `penurunan_item` DROP FOREIGN KEY `penurunan_item_penurunanId_fkey`;

-- DropIndex
DROP INDEX `pengambilan_userId_fkey` ON `pengambilan`;

-- DropIndex
DROP INDEX `pengembalian_userId_fkey` ON `pengembalian`;

-- AlterTable
ALTER TABLE `barang` DROP COLUMN `varian`;

-- AlterTable
ALTER TABLE `pengambilan` DROP COLUMN `status`,
    DROP COLUMN `userId`,
    ADD COLUMN `salesId` VARCHAR(191) NOT NULL,
    MODIFY `fotoUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `pengembalian` DROP COLUMN `userId`,
    ADD COLUMN `salesId` VARCHAR(191) NOT NULL,
    MODIFY `fotoUrl` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `pengambilan_item`;

-- DropTable
DROP TABLE `pengembalian_item`;

-- DropTable
DROP TABLE `penurunan`;

-- DropTable
DROP TABLE `penurunan_item`;

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `NIK` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'SUPERVISOR') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_NIK_key`(`NIK`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sales` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Toko` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `noHp` VARCHAR(191) NOT NULL,
    `fotoUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PengambilanItem` (
    `id` VARCHAR(191) NOT NULL,
    `pengambilanId` VARCHAR(191) NOT NULL,
    `barangId` VARCHAR(191) NOT NULL,
    `jumlah` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PengembalianItem` (
    `id` VARCHAR(191) NOT NULL,
    `pengembalianId` VARCHAR(191) NOT NULL,
    `barangId` VARCHAR(191) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `kondisi` ENUM('BAIK', 'RUSAK') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pengiriman` (
    `id` VARCHAR(191) NOT NULL,
    `salesId` VARCHAR(191) NOT NULL,
    `tokoId` VARCHAR(191) NOT NULL,
    `fotoUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PengirimanItem` (
    `id` VARCHAR(191) NOT NULL,
    `pengirimanId` VARCHAR(191) NOT NULL,
    `barangId` VARCHAR(191) NOT NULL,
    `jumlah` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pengambilan` ADD CONSTRAINT `Pengambilan_salesId_fkey` FOREIGN KEY (`salesId`) REFERENCES `Sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengambilanItem` ADD CONSTRAINT `PengambilanItem_pengambilanId_fkey` FOREIGN KEY (`pengambilanId`) REFERENCES `Pengambilan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengambilanItem` ADD CONSTRAINT `PengambilanItem_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `Barang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengembalian` ADD CONSTRAINT `Pengembalian_salesId_fkey` FOREIGN KEY (`salesId`) REFERENCES `Sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengembalianItem` ADD CONSTRAINT `PengembalianItem_pengembalianId_fkey` FOREIGN KEY (`pengembalianId`) REFERENCES `Pengembalian`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengembalianItem` ADD CONSTRAINT `PengembalianItem_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `Barang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengiriman` ADD CONSTRAINT `Pengiriman_salesId_fkey` FOREIGN KEY (`salesId`) REFERENCES `Sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengiriman` ADD CONSTRAINT `Pengiriman_tokoId_fkey` FOREIGN KEY (`tokoId`) REFERENCES `Toko`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengirimanItem` ADD CONSTRAINT `PengirimanItem_pengirimanId_fkey` FOREIGN KEY (`pengirimanId`) REFERENCES `Pengiriman`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengirimanItem` ADD CONSTRAINT `PengirimanItem_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `Barang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
