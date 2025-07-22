const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const streamifier = require('streamifier');
const cloudinary = require('../utils/cloudinary'); // Pastikan sudah setup cloudinary

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

// Create Article
const createArticle = async (req, res) => {
    try {
        const { title, content, category, authorId } = req.body;
        if (!title || !content || !category || !authorId) {
        return res.status(400).json({ error: 'Field title, content, category, dan authorId wajib diisi' });
        }

        if (!req.file) {
        return res.status(400).json({ error: 'Thumbnail wajib diupload' });
        }

        // Upload thumbnail
        const thumbnailUrl = await uploadToCloudinary(req.file.buffer, 'articles/thumbnail');

        const article = await prisma.article.create({
        data: {
            title,
            content,
            category,
            thumbnail: thumbnailUrl,
            authorId: parseInt(authorId),
        },
        include: {
            author: true,
        },
        });

        res.status(201).json({ success: true, data: article });
    } catch (error) {
        console.error('Error createArticle:', error);
        res.status(500).json({ error: 'Gagal membuat article' });
    }
};

// Get all Articles
const getAllArticles = async (req, res) => {
    try {
        const articles = await prisma.article.findMany({
        include: {
            author: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
        });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data article' });
    }
};

// Get single Article by ID
const getArticleById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const article = await prisma.article.findUnique({
        where: { id },
        include: { author: true },
        });
        if (!article) return res.status(404).json({ error: 'Article tidak ditemukan' });
        res.json(article);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil article' });
    }
};

// Update Article
const updateArticle = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title, content, category, authorId } = req.body;

        const dataToUpdate = {};
        if (title) dataToUpdate.title = title;
        if (content) dataToUpdate.content = content;
        if (category) dataToUpdate.category = category;
        if (authorId) dataToUpdate.authorId = parseInt(authorId);

        if (req.file) {
        // Upload new thumbnail jika ada
        const thumbnailUrl = await uploadToCloudinary(req.file.buffer, 'articles/thumbnail');
        dataToUpdate.thumbnail = thumbnailUrl;
        }

        const updatedArticle = await prisma.article.update({
        where: { id },
        data: dataToUpdate,
        include: { author: true },
        });

        res.json({ success: true, data: updatedArticle });
    } catch (error) {
        console.error('Error updateArticle:', error);
        res.status(500).json({ error: 'Gagal update article' });
    }
};

// Delete Article
const deleteArticle = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.article.delete({ where: { id } });
        res.json({ message: 'Article berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: 'Gagal hapus article' });
    }
};

module.exports = {
    createArticle,
    getAllArticles,
    getArticleById,
    updateArticle,
    deleteArticle,
};
