const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const driveController = require("../controllers/drive.controller");
const upload = require("../middleware/upload.middleware");

router.post("/folder", authMiddleware, driveController.createFolder);
router.get("/list", authMiddleware, driveController.listItems);
router.post("/upload", authMiddleware, upload.single("file"), driveController.uploadFile);
router.get("/download/:id", authMiddleware, driveController.downloadFile);

module.exports = router;
