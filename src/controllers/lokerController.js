const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET all
const getLoker = async (req, res) => {
    try {
        const loker = await prisma.lowonganPekerjaan.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        res.status(200).json(loker);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal mengambil data lowongan" });
    }
};

// GET by ID
const getLokerById = async (req, res) => {
    const { id } = req.params;
    try {
        const loker = await prisma.lowonganPekerjaan.findUnique({
        where: { id: parseInt(id) },
        });

        if (!loker) {
        return res.status(404).json({ error: "Lowongan tidak ditemukan" });
        }

        res.status(200).json(loker);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan saat mengambil data" });
    }
};

// POST create
const createLoker = async (req, res) => {
  const {
    posisi,
    perusahaan, // Optional karena ada default di schema
    lokasi,
    deskripsi,
    kualifikasi,
    jenis,
    gaji,
    deadline,
  } = req.body;

  try {
    const newLoker = await prisma.lowonganPekerjaan.create({
      data: {
        posisi,
        perusahaan: perusahaan || undefined, // default akan dipakai jika tidak dikirim
        lokasi,
        deskripsi,
        kualifikasi,
        jenis,
        gaji: gaji ? parseInt(gaji) : null,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    res.status(201).json(newLoker);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menambahkan lowongan" });
  }
};

// PUT update
const updateLoker = async (req, res) => {
  const { id } = req.params;
  const {
    posisi,
    perusahaan,
    lokasi,
    deskripsi,
    kualifikasi,
    jenis,
    gaji,
    deadline,
  } = req.body;

  try {
    const updated = await prisma.lowonganPekerjaan.update({
      where: { id: parseInt(id) },
      data: {
        posisi,
        perusahaan,
        lokasi,
        deskripsi,
        kualifikasi,
        jenis,
        gaji: gaji ? parseInt(gaji) : null,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengupdate lowongan" });
  }
};

// DELETE
const deleteLoker = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.lowonganPekerjaan.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Lowongan berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menghapus lowongan" });
  }
};

module.exports = {
  getLoker,
  getLokerById,
  createLoker,
  updateLoker,
  deleteLoker,
};
