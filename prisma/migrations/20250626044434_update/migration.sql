/*
  Warnings:

  - You are about to drop the column `createdAt` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `toko` table. All the data in the column will be lost.
  - You are about to drop the `pengiriman` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pengirimanitem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `varian` to the `Barang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Pengambilan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Pengembalian` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `pengambilan` DROP FOREIGN KEY `Pengambilan_salesId_fkey`;

-- DropForeignKey
ALTER TABLE `pengambilanitem` DROP FOREIGN KEY `PengambilanItem_barangId_fkey`;

-- DropForeignKey
ALTER TABLE `pengambilanitem` DROP FOREIGN KEY `PengambilanItem_pengambilanId_fkey`;

-- DropForeignKey
ALTER TABLE `pengembalian` DROP FOREIGN KEY `Pengembalian_salesId_fkey`;

-- DropForeignKey
ALTER TABLE `pengembalianitem` DROP FOREIGN KEY `PengembalianItem_barangId_fkey`;

-- DropForeignKey
ALTER TABLE `pengembalianitem` DROP FOREIGN KEY `PengembalianItem_pengembalianId_fkey`;

-- DropForeignKey
ALTER TABLE `pengiriman` DROP FOREIGN KEY `Pengiriman_salesId_fkey`;

-- DropForeignKey
ALTER TABLE `pengiriman` DROP FOREIGN KEY `Pengiriman_tokoId_fkey`;

-- DropForeignKey
ALTER TABLE `pengirimanitem` DROP FOREIGN KEY `PengirimanItem_barangId_fkey`;

-- DropForeignKey
ALTER TABLE `pengirimanitem` DROP FOREIGN KEY `PengirimanItem_pengirimanId_fkey`;

-- DropIndex
DROP INDEX `Pengambilan_salesId_fkey` ON `pengambilan`;

-- DropIndex
DROP INDEX `PengambilanItem_barangId_fkey` ON `pengambilanitem`;

-- DropIndex
DROP INDEX `PengambilanItem_pengambilanId_fkey` ON `pengambilanitem`;

-- DropIndex
DROP INDEX `Pengembalian_salesId_fkey` ON `pengembalian`;

-- DropIndex
DROP INDEX `PengembalianItem_barangId_fkey` ON `pengembalianitem`;

-- DropIndex
DROP INDEX `PengembalianItem_pengembalianId_fkey` ON `pengembalianitem`;

-- AlterTable
ALTER TABLE `barang` ADD COLUMN `varian` ENUM('HALUS', 'KASAR') NOT NULL;

-- AlterTable
ALTER TABLE `pengambilan` ADD COLUMN `status` ENUM('PENDING', 'DISETUJUI', 'DITOLAK') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `pengembalian` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `sales` DROP COLUMN `createdAt`;

-- AlterTable
ALTER TABLE `toko` DROP COLUMN `createdAt`,
    ADD COLUMN `salesId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'SUPERVISOR', 'SALES') NOT NULL;

-- DropTable
DROP TABLE `pengiriman`;

-- DropTable
DROP TABLE `pengirimanitem`;

-- CreateTable
CREATE TABLE `Barcode` (
    `id` VARCHAR(191) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `usedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `Barcode_usedBy_key`(`usedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Penurunan` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `salesId` VARCHAR(191) NOT NULL,
    `tokoId` VARCHAR(191) NOT NULL,
    `fotoUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PenurunanItem` (
    `id` VARCHAR(191) NOT NULL,
    `penurunanId` VARCHAR(191) NOT NULL,
    `barangId` VARCHAR(191) NOT NULL,
    `jumlah` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Toko` ADD CONSTRAINT `Toko_salesId_fkey` FOREIGN KEY (`salesId`) REFERENCES `Sales`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Barcode` ADD CONSTRAINT `Barcode_usedBy_fkey` FOREIGN KEY (`usedBy`) REFERENCES `Toko`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengambilan` ADD CONSTRAINT `Pengambilan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengambilan` ADD CONSTRAINT `Pengambilan_salesId_fkey` FOREIGN KEY (`salesId`) REFERENCES `Sales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengambilanItem` ADD CONSTRAINT `PengambilanItem_pengambilanId_fkey` FOREIGN KEY (`pengambilanId`) REFERENCES `Pengambilan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengambilanItem` ADD CONSTRAINT `PengambilanItem_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `Barang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Penurunan` ADD CONSTRAINT `Penurunan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Penurunan` ADD CONSTRAINT `Penurunan_salesId_fkey` FOREIGN KEY (`salesId`) REFERENCES `Sales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Penurunan` ADD CONSTRAINT `Penurunan_tokoId_fkey` FOREIGN KEY (`tokoId`) REFERENCES `Toko`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PenurunanItem` ADD CONSTRAINT `PenurunanItem_penurunanId_fkey` FOREIGN KEY (`penurunanId`) REFERENCES `Penurunan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PenurunanItem` ADD CONSTRAINT `PenurunanItem_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `Barang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengembalian` ADD CONSTRAINT `Pengembalian_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengembalian` ADD CONSTRAINT `Pengembalian_salesId_fkey` FOREIGN KEY (`salesId`) REFERENCES `Sales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengembalianItem` ADD CONSTRAINT `PengembalianItem_pengembalianId_fkey` FOREIGN KEY (`pengembalianId`) REFERENCES `Pengembalian`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengembalianItem` ADD CONSTRAINT `PengembalianItem_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `Barang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
