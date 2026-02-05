const DriveItem = require("../models/DriveItem");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// CREATE FOLDER
exports.createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    const folder = await DriveItem.create({
      name,
      type: "folder",
      owner: req.user._id,
      parentId: parentId || null,
    });

    res.status(201).json({
      message: "Folder created successfully ✅",
      folder,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LIST FILES & FOLDERS
exports.listItems = async (req, res) => {
  try {
    const { parentId } = req.query;

    const items = await DriveItem.find({
      owner: req.user._id,
      parentId: parentId || null,
    }).sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const parentId = req.query.parentId || null;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded ❌" });
    }

    const s3Key = `${req.user._id}/${Date.now()}-${file.originalname}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const driveItem = await DriveItem.create({
      name: file.originalname,
      type: "file",
      owner: req.user._id,
      parentId,
      s3Key,
      size: file.size,
    });

    res.status(201).json({
      message: "File uploaded successfully ✅",
      file: driveItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed ❌", error: error.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    // find file
    const file = await DriveItem.findById(id);

    if (!file || file.type !== "file") {
      return res.status(404).json({ message: "File not found ❌" });
    }

    // owner check
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied ❌" });
    }

    // generate signed URL
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.s3Key,
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: 60 * 5, // 5 minutes
    });

    res.status(200).json({
      message: "Download link generated ✅",
      url: signedUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Download failed ❌", error: error.message });
  }
};
