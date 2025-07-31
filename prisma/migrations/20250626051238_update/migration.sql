/*
  Warnings:

  - A unique constraint covering the columns `[barcodeId]` on the table `Toko` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `barcodeId` to the `Toko` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `barcode` DROP FOREIGN KEY `Barcode_usedBy_fkey`;

-- AlterTable
ALTER TABLE `toko` ADD COLUMN `barcodeId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Toko_barcodeId_key` ON `Toko`(`barcodeId`);

-- AddForeignKey
ALTER TABLE `Toko` ADD CONSTRAINT `Toko_barcodeId_fkey` FOREIGN KEY (`barcodeId`) REFERENCES `Barcode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
