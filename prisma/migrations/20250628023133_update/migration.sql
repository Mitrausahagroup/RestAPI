/*
  Warnings:

  - Made the column `salesId` on table `toko` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `toko` DROP FOREIGN KEY `Toko_salesId_fkey`;

-- DropIndex
DROP INDEX `Toko_salesId_fkey` ON `toko`;

-- AlterTable
ALTER TABLE `toko` MODIFY `salesId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Toko` ADD CONSTRAINT `Toko_salesId_fkey` FOREIGN KEY (`salesId`) REFERENCES `Sales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
