const express = require("express");
const router = express.Router();
const fasilitasControllers = require("../controllers/fasilitasControllers");
const upload = require("../middleware/uploadCloudinary");

router.get("/", fasilitasControllers.getFasilitas);
router.post("/", upload.single("icon"), fasilitasControllers.createFasilitas);
router.put("/:id", upload.single("icon"), fasilitasControllers.editFasilitas);
router.delete("/:id", fasilitasControllers.deleteFasilitas);

module.exports = router;
