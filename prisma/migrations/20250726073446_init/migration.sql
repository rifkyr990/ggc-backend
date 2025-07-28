/*
  Warnings:

  - Added the required column `type` to the `Perumahan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Perumahan" ADD COLUMN     "type" TEXT NOT NULL;
