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

const createPerumahan = async (req, res) => {
  try {
    // Validasi input dasar
    if (!req.body) {
      return res.status(400).json({ error: "Request body tidak boleh kosong" });
    }

    const {
      nama,
      lokasi,
      hargaMulai,
      deskripsi,
      spesifikasi,
      fasilitasIds,
    } = req.body;

    // Validasi field wajib
    if (!nama || !lokasi || !hargaMulai || !deskripsi || !spesifikasi || !fasilitasIds) {
      return res.status(400).json({ 
        error: "Semua field wajib diisi: nama, lokasi, hargaMulai, deskripsi, spesifikasi, fasilitasIds" 
      });
    }

    console.log('BODY:', req.body);
    console.log('FILES:', req.files);

    let parsedSpesifikasi, parsedFasilitasIds;

    // Parsing spesifikasi
    try {
      parsedSpesifikasi = typeof spesifikasi === 'string' ? JSON.parse(spesifikasi) : spesifikasi;
      if (!Array.isArray(parsedSpesifikasi)) {
        return res.status(400).json({ error: "Format spesifikasi harus berupa array" });
      }
    } catch (e) {
      return res.status(400).json({ 
        error: "Format spesifikasi tidak valid",
        detail: e.message 
      });
    }

    // Parsing fasilitas
    try {
      parsedFasilitasIds = typeof fasilitasIds === 'string' ? JSON.parse(fasilitasIds) : fasilitasIds;
      if (!Array.isArray(parsedFasilitasIds)) {
        return res.status(400).json({ error: "Format fasilitasIds harus berupa array" });
      }
    } catch (e) {
      return res.status(400).json({ 
        error: "Format fasilitasIds tidak valid",
        detail: e.message 
      });
    }

    // Validasi file upload
    if (!req.files || !req.files['thumbnail'] || req.files['thumbnail'].length === 0) {
      return res.status(400).json({ error: "Thumbnail wajib diupload" });
    }

    const thumbnailBuffer = req.files['thumbnail'][0].buffer;
    const gambarLainnyaFiles = req.files['gambarLainnya'] || [];

    // Upload thumbnail
    const thumbnailUrl = await uploadToCloudinary(thumbnailBuffer, 'perumahan/thumbnail');

    // Upload multiple gambarLainnya
    const gambarLainnyaUrls = await Promise.all(
      gambarLainnyaFiles.map(file =>
        uploadToCloudinary(file.buffer, 'perumahan/gambarLainnya')
      )
    );

    // Simpan ke database
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

    res.status(201).json({
      success: true,
      data: perumahan
    });
  } catch (error) {
    console.error("Error creating perumahan:", error);
    
    res.status(500).json({ 
      error: "Terjadi kesalahan saat membuat perumahan",
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

    // Ambil gambar jika di-upload
    const thumbnail = req.files['thumbnail']?.[0]?.path;
    const gambarLainnya = req.files['gambarLainnya']?.map(file => file.path);

    // Update data utama
    const updatedPerumahan = await prisma.perumahan.update({
      where: { id },
      data: {
        nama,
        lokasi,
        hargaMulai: parseInt(hargaMulai),
        deskripsi,
        ...(thumbnail && { thumbnail }), // hanya update jika ada file
        ...(gambarLainnya && { gambarLainnya }),
      },
    });

    // Replace spesifikasi
    if (spesifikasi) {
      await prisma.spesifikasiPerumahan.deleteMany({ where: { perumahanId: id } });
      await prisma.spesifikasiPerumahan.createMany({
        data: JSON.parse(spesifikasi).map(s => ({
          ...s,
          perumahanId: id,
        })),
      });
    }

    // Replace fasilitas
    if (fasilitasIds) {
      await prisma.fasilitasPerumahan.deleteMany({ where: { perumahanId: id } });
      await prisma.fasilitasPerumahan.createMany({
        data: JSON.parse(fasilitasIds).map(fid => ({
          perumahanId: id,
          fasilitasId: fid,
        })),
      });
    }

    // Ambil data final
    const result = await prisma.perumahan.findUnique({
      where: { id },
      include: {
        spesifikasi: true,
        fasilitas: {
          include: { fasilitas: true },
        },
      },
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update perumahan' });
  }
};


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
