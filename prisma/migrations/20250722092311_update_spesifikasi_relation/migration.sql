/*
  Warnings:

  - A unique constraint covering the columns `[perumahanId]` on the table `SpesifikasiPerumahan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Perumahan" ADD COLUMN     "spesifikasiId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "SpesifikasiPerumahan_perumahanId_key" ON "SpesifikasiPerumahan"("perumahanId");
