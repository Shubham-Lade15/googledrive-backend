const mongoose = require("mongoose");

const driveItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["file", "folder"],
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriveItem",
      default: null, // root level
    },

    // only for files
    s3Key: {
      type: String,
      default: null,
    },

    size: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DriveItem", driveItemSchema);
