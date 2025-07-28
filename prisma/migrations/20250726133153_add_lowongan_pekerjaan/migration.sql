-- AlterTable
ALTER TABLE "Perumahan" ALTER COLUMN "type" DROP NOT NULL;

-- CreateTable
CREATE TABLE "LowonganPekerjaan" (
    "id" SERIAL NOT NULL,
    "posisi" TEXT NOT NULL,
    "perusahaan" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kualifikasi" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "gaji" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LowonganPekerjaan_pkey" PRIMARY KEY ("id")
);
