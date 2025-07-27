const express = require('express');
const router = express.Router();
const perumahanController = require('../controllers/perumahanControllers');
const upload = require('../middleware/uploadCloudinary');

router.get('/', perumahanController.getAllPerumahan);
router.get('/filter', perumahanController.filterPerumahan); // ⬅ duluan
router.get("/:slug", perumahanController.getPerumahanBySlug);
router.post(
  '/create',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'gambarLainnya', maxCount: 10 },
  ]),
  perumahanController.createPerumahan
);
router.put(
  '/:id',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'gambarLainnya', maxCount: 5 },
  ]),
  perumahanController.updatePerumahan
);
router.delete('/:id', perumahanController.deletePerumahan);

module.exports = router;
