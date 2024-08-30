/*
  Warnings:

  - Added the required column `confirmed` to the `Register` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `register` ADD COLUMN `confirmed` BOOLEAN NOT NULL;
