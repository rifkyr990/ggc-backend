const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getFasilitas = async (req, res) => {
    try {
        const fasilitas = await prisma.fasilitas.findMany();
        res.status(200).send(fasilitas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const createFasilitas = async (req, res) => {
    const { nama, iconUrl } = req.body;

    try {
        const newFasilitas = await prisma.fasilitas.create({
            data: { nama, iconUrl }
        });
        res.status(201).send(newFasilitas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const editFasilitas = async (req, res) => { // ✅ perbaiki nama
    const { id } = req.params;
    const { nama, iconUrl } = req.body;

    try {
        const updatedFasilitas = await prisma.fasilitas.update({
            where: { id: Number(id) },
            data: { nama, iconUrl }
        });
        res.status(200).send(updatedFasilitas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const deleteFasilitas = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.fasilitas.delete({
            where: { id: Number(id) }
        });

        res.status(200).json({
            success: true,
            message: "Fasilitas berhasil dihapus"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFasilitas,
    createFasilitas,
    editFasilitas, // ✅ gunakan nama yang benar
    deleteFasilitas
};
