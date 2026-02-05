const express = require("express");
const cors = require("cors");

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://googledrive-frontend-swart.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());

require("dotenv").config();

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");
const driveRoutes = require("./src/routes/drive.routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// connect DB
connectDB();
app.use("/api/auth", authRoutes);
app.use("/api/drive", driveRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Google Drive Backend is running ✅" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
