const express = require("express");
const cors = require("cors");
require("dotenv").config();


// 📌 Import API Routes
const authRoutes = require("./routes/auth");
const notificationsRoutes = require("./routes/notifications");
const boardsRouter = require("./routes/boards");
const boardMembersRouter = require("./routes/board_members");
const boardColumnsRouter = require('./routes/board_columns');
const tasksRouter = require("./routes/tasks");
const task_assignees = require("./routes/taskAssignees");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ ใช้ API ที่กำหนด
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api", boardsRouter);
app.use("/api", boardMembersRouter); // ใช้งาน API สมาชิกของ Board
app.use('/api/board_columns', boardColumnsRouter);
app.use("/api/boards", boardsRouter);  // ✅ ต้องเป็นแบบนี้
app.use("/api/tasks", tasksRouter);
app.use("/api/task_assignees",task_assignees);

// ✅ ฟังก์ชันเริ่มต้นเซิร์ฟเวอร์หลังจากเชื่อม DB สำเร็จ
const startServer = async () => {
  try {
    
    // ✅ เริ่มต้นเซิร์ฟเวอร์
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Database connection or sync error:", err);
    process.exit(1);
  }
};

// ✅ เรียกใช้ฟังก์ชันเริ่มต้นเซิร์ฟเวอร์
startServer();

// ✅ จัดการ Error ให้ API Response
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});
