/*
  Warnings:

  - You are about to drop the column `fotoUrl` on the `pengambilan_item` table. All the data in the column will be lost.
  - You are about to drop the column `fotoUrl` on the `pengembalian_item` table. All the data in the column will be lost.
  - You are about to drop the column `fotoUrl` on the `penurunan_item` table. All the data in the column will be lost.
  - Added the required column `fotoUrl` to the `pengambilan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fotoUrl` to the `pengembalian` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fotoUrl` to the `penurunan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pengambilan` ADD COLUMN `fotoUrl` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `pengambilan_item` DROP COLUMN `fotoUrl`;

-- AlterTable
ALTER TABLE `pengembalian` ADD COLUMN `fotoUrl` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `pengembalian_item` DROP COLUMN `fotoUrl`;

-- AlterTable
ALTER TABLE `penurunan` ADD COLUMN `fotoUrl` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `penurunan_item` DROP COLUMN `fotoUrl`;
