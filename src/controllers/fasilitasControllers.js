const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

const getFasilitas = async (req, res) => {
    try {
        // Ambil query params
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        const where = search
            ? {
                nama: {
                    contains: search,
                    mode: 'insensitive',
                },
                }
            : {};

        // Ambil data dan total count secara paralel
        const [data, total] = await Promise.all([
            prisma.fasilitas.findMany({
                where,
                skip: offset,
                take: limit,
                // orderBy: {
                //   createdAt: 'desc', // ✅ properti yang benar adalah `createdAt`
                // },
            }),
            prisma.fasilitas.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        // Kirim respons
        res.json({
            data,
            total,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error('Error getFasilitas:', error);
        res.status(500).json({ message: 'Gagal mengambil data fasilitas', detail: error.message });
    }
};

const createFasilitas = async (req, res) => {
    try {
        const { nama } = req.body;

        if (!nama) {
            return res.status(400).json({ message: 'Nama fasilitas wajib diisi' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Icon fasilitas wajib diupload' });
        }

        const iconUrl = await uploadToCloudinary(req.file.buffer, 'fasilitas/icon');

        const newFasilitas = await prisma.fasilitas.create({
            data: { nama, iconUrl },
        });

        res.status(201).json(newFasilitas);
    } catch (error) {
        console.error('Gagal membuat fasilitas:', error);
        res.status(500).json({ message: 'Gagal membuat fasilitas', detail: error.message });
    }
};


const editFasilitas = async (req, res) => {
    const { id } = req.params;
    const { nama } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ message: "ID tidak valid" });
    }

    try {
        const fasilitas = await prisma.fasilitas.findUnique({
            where: { id: Number(id) },
        });

        if (!fasilitas) {
            return res.status(404).json({ message: "Fasilitas tidak ditemukan" });
        }

        let iconUrl = fasilitas.iconUrl;

        if (req.file) {
            iconUrl = await uploadToCloudinary(req.file.buffer, 'fasilitas/icon');
        }

        const updatedFasilitas = await prisma.fasilitas.update({
            where: { id: Number(id) },
            data: {
                nama: nama || fasilitas.nama,
                iconUrl,
            },
        });

        res.status(200).json(updatedFasilitas);
    } catch (error) {
        console.error("Gagal update fasilitas:", error);
        res.status(500).json({ message: "Gagal mengupdate fasilitas", detail: error.message });
    }
};

const deleteFasilitas = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.fasilitasPerumahan.deleteMany({
            where: { fasilitasId: Number(id) },
        });

        await prisma.fasilitas.delete({
            where: { id: Number(id) },
        });

        res.status(200).json({
            success: true,
            message: "Fasilitas berhasil dihapus",
        });
    } catch (error) {
        console.error('Gagal hapus fasilitas:', error);
        res.status(500).json({ message: 'Gagal menghapus fasilitas', detail: error.message });
    }
};


module.exports = {
    getFasilitas,
    createFasilitas,
    editFasilitas,
    deleteFasilitas
};
