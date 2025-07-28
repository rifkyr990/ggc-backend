const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorControllers');

router.get('/daily', visitorController.getDailyVisitors);
router.get('/monthly', visitorController.getMonthlyVisitors);

module.exports = router;