-- DropForeignKey
ALTER TABLE `pengambilan` DROP FOREIGN KEY `Pengambilan_userId_fkey`;

-- DropForeignKey
ALTER TABLE `pengembalian` DROP FOREIGN KEY `Pengembalian_userId_fkey`;

-- DropForeignKey
ALTER TABLE `penurunan` DROP FOREIGN KEY `Penurunan_userId_fkey`;

-- DropIndex
DROP INDEX `Pengambilan_userId_fkey` ON `pengambilan`;

-- DropIndex
DROP INDEX `Pengembalian_userId_fkey` ON `pengembalian`;

-- DropIndex
DROP INDEX `Penurunan_userId_fkey` ON `penurunan`;

-- AlterTable
ALTER TABLE `pengambilan` MODIFY `userId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `pengembalian` MODIFY `userId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `penurunan` MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Pengambilan` ADD CONSTRAINT `Pengambilan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Penurunan` ADD CONSTRAINT `Penurunan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengembalian` ADD CONSTRAINT `Pengembalian_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
