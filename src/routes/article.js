const express = require('express');
const router = express.Router();
const articlesControllers = require('../controllers/articleControllers');
const upload = require('../middleware/uploadCloudinary'); // pakai memory storage untuk buffer

router.get('/', articlesControllers.getAllArticles);
router.get('/:id', articlesControllers.getArticleById);
router.post('/', upload.single('thumbnail'), articlesControllers.createArticle);
router.put(
    '/:id',
    upload.single('thumbnail'), // Hanya satu file untuk thumbnail
    articlesControllers.updateArticle
);
router.delete('/:id', articlesControllers.deleteArticle);

module.exports = router;
