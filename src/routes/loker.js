const express = require("express");
const router = express.Router();
const lokerController = require("../controllers/lokerController");

router.get("/", lokerController.getLoker);
router.get("/:id", lokerController.getLokerById);
router.post("/", lokerController.createLoker);
router.put("/:id", lokerController.updateLoker);
router.delete("/:id", lokerController.deleteLoker);

module.exports = router;
