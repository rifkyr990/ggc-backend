const express = require('express');
const router = express.Router();
const fasilitasControllers = require('../controllers/fasilitasControllers')

router.get('/', fasilitasControllers.getFasilitas);
router.post('/', fasilitasControllers.createFasilitas);
router.put('/:id', fasilitasControllers.editFasilitas);
router.delete('/:id', fasilitasControllers.deleteFasilitas);

module.exports = router;