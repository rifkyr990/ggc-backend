const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const streamifier = require('streamifier');
const cloudinary = require('../utils/cloudinary'); // ✅ pastikan path benar


const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// CREATE
const createPerumahan = async (req, res) => {
  try {
    const {
      nama,
      lokasi,
      hargaMulai,
      deskripsi,
      spesifikasi,
      fasilitasIds,
    } = req.body;

    if (!nama || !lokasi || !hargaMulai || !deskripsi || !spesifikasi || !fasilitasIds) {
      return res.status(400).json({
        error: "Field wajib: nama, lokasi, hargaMulai, deskripsi, spesifikasi, fasilitasIds"
      });
    }

    let parsedSpesifikasi, parsedFasilitasIds;

    try {
      parsedSpesifikasi = typeof spesifikasi === 'string' ? JSON.parse(spesifikasi) : spesifikasi;
      if (typeof parsedSpesifikasi !== 'object' || Array.isArray(parsedSpesifikasi)) {
        return res.status(400).json({ error: "Format spesifikasi harus berupa object" });
      }
    } catch (e) {
      return res.status(400).json({ error: "Format spesifikasi tidak valid", detail: e.message });
    }

    try {
      parsedFasilitasIds = typeof fasilitasIds === 'string' ? JSON.parse(fasilitasIds) : fasilitasIds;
      if (!Array.isArray(parsedFasilitasIds)) {
        return res.status(400).json({ error: "Format fasilitasIds harus berupa array" });
      }
    } catch (e) {
      return res.status(400).json({ error: "Format fasilitasIds tidak valid", detail: e.message });
    }

    if (!req.files || !req.files['thumbnail'] || req.files['thumbnail'].length === 0) {
      return res.status(400).json({ error: "Thumbnail wajib diupload" });
    }

    const thumbnailBuffer = req.files['thumbnail'][0].buffer;
    const gambarLainnyaFiles = req.files['gambarLainnya'] || [];

    const thumbnailUrl = await uploadToCloudinary(thumbnailBuffer, 'perumahan/thumbnail');

    const gambarLainnyaUrls = await Promise.all(
      gambarLainnyaFiles.map(file =>
        uploadToCloudinary(file.buffer, 'perumahan/gambarLainnya')
      )
    );

    const perumahan = await prisma.perumahan.create({
      data: {
        nama,
        lokasi,
        hargaMulai: parseInt(hargaMulai),
        deskripsi,
        thumbnail: thumbnailUrl,
        gambarLainnya: gambarLainnyaUrls,
        spesifikasi: {
          create: parsedSpesifikasi,
        },
        fasilitas: {
          create: parsedFasilitasIds.map(id => ({
            fasilitasId: id,
          })),
        },
      },
      include: {
        spesifikasi: true,
        fasilitas: {
          include: { fasilitas: true },
        },
      },
    });

    res.status(201).json({ success: true, data: perumahan });
  } catch (error) {
    console.error("Error creating perumahan:", error);
    res.status(500).json({
      error: "Terjadi kesalahan saat membuat perumahan",
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// UPDATE
const updatePerumahan = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const {
      nama,
      lokasi,
      hargaMulai,
      deskripsi,
      spesifikasi,
      fasilitasIds,
    } = req.body;

    const existing = await prisma.perumahan.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Perumahan tidak ditemukan" });

    let parsedSpesifikasi, parsedFasilitasIds;

    try {
      parsedSpesifikasi = typeof spesifikasi === 'string' ? JSON.parse(spesifikasi) : spesifikasi;
      if (typeof parsedSpesifikasi !== 'object' || Array.isArray(parsedSpesifikasi)) {
        return res.status(400).json({ error: "Format spesifikasi harus berupa object" });
      }
    } catch (e) {
      return res.status(400).json({ error: "Format spesifikasi tidak valid", detail: e.message });
    }

    try {
      parsedFasilitasIds = typeof fasilitasIds === 'string' ? JSON.parse(fasilitasIds) : fasilitasIds;
      if (!Array.isArray(parsedFasilitasIds)) {
        return res.status(400).json({ error: "Format fasilitasIds harus berupa array" });
      }
    } catch (e) {
      return res.status(400).json({ error: "Format fasilitasIds tidak valid", detail: e.message });
    }

    let thumbnailUrl = existing.thumbnail;
    let gambarLainnyaUrls = existing.gambarLainnya || [];

    if (req.files && req.files['thumbnail']) {
      const thumbnailBuffer = req.files['thumbnail'][0].buffer;
      thumbnailUrl = await uploadToCloudinary(thumbnailBuffer, 'perumahan/thumbnail');
    }

    if (req.files && req.files['gambarLainnya']) {
      gambarLainnyaUrls = await Promise.all(
        req.files['gambarLainnya'].map(file =>
          uploadToCloudinary(file.buffer, 'perumahan/gambarLainnya')
        )
      );
    }

    // Update data utama perumahan
    await prisma.perumahan.update({
      where: { id },
      data: {
        nama,
        lokasi,
        hargaMulai: parseInt(hargaMulai),
        deskripsi,
        thumbnail: thumbnailUrl,
        gambarLainnya: gambarLainnyaUrls,
      },
    });

    // Update atau buat spesifikasi (one-to-one)
    const existingSpesifikasi = await prisma.spesifikasiPerumahan.findUnique({
      where: { perumahanId: id },
    });

    if (existingSpesifikasi) {
      await prisma.spesifikasiPerumahan.update({
        where: { perumahanId: id },
        data: parsedSpesifikasi,
      });
    } else {
      await prisma.spesifikasiPerumahan.create({
        data: {
          ...parsedSpesifikasi,
          perumahanId: id,
        },
      });
    }

    // Hapus dan ganti fasilitas
    await prisma.fasilitasPerumahan.deleteMany({ where: { perumahanId: id } });
    await prisma.fasilitasPerumahan.createMany({
      data: parsedFasilitasIds.map(fasilitasId => ({
        perumahanId: id,
        fasilitasId,
      })),
    });

    const updated = await prisma.perumahan.findUnique({
      where: { id },
      include: {
        spesifikasi: true,
        fasilitas: {
          include: { fasilitas: true },
        },
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating perumahan:", error);
    res.status(500).json({
      error: "Terjadi kesalahan saat mengupdate perumahan",
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Read all Perumahan lengkap dengan relasi
const getAllPerumahan = async (req, res) => {
  try {
    const perumahans = await prisma.perumahan.findMany({
      include: {
        spesifikasi: true,
        fasilitas: {
          include: {
            fasilitas: true,
          },
        },
      },
    });
    res.json(perumahans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch perumahan' });
  }
};

// Read single Perumahan by id
const getPerumahanById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const perumahan = await prisma.perumahan.findUnique({
      where: { id },
      include: {
        spesifikasi: true,
        fasilitas: {
          include: {
            fasilitas: true,
          },
        },
      },
    });
    if (!perumahan) return res.status(404).json({ error: 'Perumahan not found' });
    res.json(perumahan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch perumahan' });
  }
};

// Update Perumahan + spesifikasi + fasilitas (replace semua fasilitas dan spesifikasi)
// const updatePerumahan = async (req, res) => {
//   const id = parseInt(req.params.id);

//   try {
//     // Validasi dasar
//     if (!req.body) {
//       return res.status(400).json({ error: "Request body tidak boleh kosong" });
//     }

//     const {
//       nama,
//       lokasi,
//       hargaMulai,
//       deskripsi,
//       spesifikasi,
//       fasilitasIds,
//     } = req.body;

//     let parsedSpesifikasi, parsedFasilitasIds;

//     try {
//       parsedSpesifikasi = typeof spesifikasi === 'string' ? JSON.parse(spesifikasi) : spesifikasi;
//       if (!Array.isArray(parsedSpesifikasi)) {
//         return res.status(400).json({ error: "Format spesifikasi harus berupa array" });
//       }
//     } catch (e) {
//       return res.status(400).json({
//         error: "Format spesifikasi tidak valid",
//         detail: e.message
//       });
//     }

//     try {
//       parsedFasilitasIds = typeof fasilitasIds === 'string' ? JSON.parse(fasilitasIds) : fasilitasIds;
//       if (!Array.isArray(parsedFasilitasIds)) {
//         return res.status(400).json({ error: "Format fasilitasIds harus berupa array" });
//       }
//     } catch (e) {
//       return res.status(400).json({
//         error: "Format fasilitasIds tidak valid",
//         detail: e.message
//       });
//     }

//     const existing = await prisma.perumahan.findUnique({ where: { id } });
//     if (!existing) return res.status(404).json({ error: "Perumahan tidak ditemukan" });

//     // File handling
//     let thumbnailUrl = existing.thumbnail;
//     let gambarLainnyaUrls = existing.gambarLainnya || [];

//     if (req.files && req.files['thumbnail']) {
//       const thumbnailBuffer = req.files['thumbnail'][0].buffer;
//       thumbnailUrl = await uploadToCloudinary(thumbnailBuffer, 'perumahan/thumbnail');
//     }

//     if (req.files && req.files['gambarLainnya']) {
//       gambarLainnyaUrls = await Promise.all(
//         req.files['gambarLainnya'].map(file =>
//           uploadToCloudinary(file.buffer, 'perumahan/gambarLainnya')
//         )
//       );
//     }

//     // Hapus relasi lama
//     await prisma.spesifikasiPerumahan.deleteMany({ where: { perumahanId: id } });
//     await prisma.fasilitasPerumahan.deleteMany({ where: { perumahanId: id } });

//     // Update data utama
//     const updated = await prisma.perumahan.update({
//       where: { id },
//       data: {
//         nama,
//         lokasi,
//         hargaMulai: parseInt(hargaMulai),
//         deskripsi,
//         thumbnail: thumbnailUrl,
//         gambarLainnya: gambarLainnyaUrls,
//         spesifikasi: {
//           create: parsedSpesifikasi,
//         },
//         fasilitas: {
//           create: parsedFasilitasIds.map(fasilitasId => ({
//             fasilitasId,
//           })),
//         },
//       },
//       include: {
//         spesifikasi: true,
//         fasilitas: {
//           include: { fasilitas: true },
//         },
//       },
//     });

//     res.json({ success: true, data: updated });
//   } catch (error) {
//     console.error("Error updating perumahan:", error);
//     res.status(500).json({
//       error: "Terjadi kesalahan saat mengupdate perumahan",
//       detail: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };


// Delete Perumahan + cascade spesifikasi & fasilitas relation
const deletePerumahan = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        // Hapus spesifikasi dulu
        await prisma.spesifikasiPerumahan.deleteMany({ where: { perumahanId: id } });
        // Hapus fasilitas relation dulu
        await prisma.fasilitasPerumahan.deleteMany({ where: { perumahanId: id } });
        // Hapus perumahan
        await prisma.perumahan.delete({ where: { id } });

        res.json({ message: 'Perumahan deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete perumahan' });
    }
};

module.exports = {
    createPerumahan,
    getAllPerumahan,
    getPerumahanById,
    updatePerumahan,
    deletePerumahan,
};
