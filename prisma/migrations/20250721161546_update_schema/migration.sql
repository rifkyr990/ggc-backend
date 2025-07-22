-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perumahan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "hargaMulai" INTEGER NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "gambarLainnya" TEXT[],
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Perumahan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpesifikasiPerumahan" (
    "id" SERIAL NOT NULL,
    "perumahanId" INTEGER NOT NULL,
    "luasTanah" INTEGER NOT NULL,
    "luasBangunan" INTEGER NOT NULL,
    "kamarTidur" INTEGER NOT NULL,
    "kamarMandi" INTEGER NOT NULL,
    "garasi" BOOLEAN NOT NULL,
    "listrik" TEXT NOT NULL,

    CONSTRAINT "SpesifikasiPerumahan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fasilitas" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL,

    CONSTRAINT "Fasilitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FasilitasPerumahan" (
    "id" SERIAL NOT NULL,
    "perumahanId" INTEGER NOT NULL,
    "fasilitasId" INTEGER NOT NULL,

    CONSTRAINT "FasilitasPerumahan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FasilitasPerumahan_perumahanId_fasilitasId_key" ON "FasilitasPerumahan"("perumahanId", "fasilitasId");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpesifikasiPerumahan" ADD CONSTRAINT "SpesifikasiPerumahan_perumahanId_fkey" FOREIGN KEY ("perumahanId") REFERENCES "Perumahan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FasilitasPerumahan" ADD CONSTRAINT "FasilitasPerumahan_perumahanId_fkey" FOREIGN KEY ("perumahanId") REFERENCES "Perumahan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FasilitasPerumahan" ADD CONSTRAINT "FasilitasPerumahan_fasilitasId_fkey" FOREIGN KEY ("fasilitasId") REFERENCES "Fasilitas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
