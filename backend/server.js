// backend/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const boardRoutes = require("./routes/boards"); // Import API
const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

// ใช้ API Board ที่ `/api/boards`
app.use("/api/boards", boardRoutes);
app.use("/api/auth",authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
