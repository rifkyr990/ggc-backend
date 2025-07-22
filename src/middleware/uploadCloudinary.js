// middleware/upload.js
const multer = require('multer');
const storage = multer.memoryStorage(); // file tidak disimpan di disk
const upload = multer({ storage });

module.exports = upload;
