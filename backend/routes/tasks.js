const express = require("express");
const pool = require("../config/db"); // เชื่อมต่อ Database
const router = express.Router();

/**
 * ✅ API สร้าง Task ใหม่
 * Method: POST
 * URL: /api/tasks
 * Body: { column_id, title, position }
 */
// ✅ API สร้าง Task ใหม่
router.post("/", async (req, res) => {
    const { board_id, column_id, title, description, position } = req.body;

    if (!board_id || !column_id || !title) {
        console.error("❌ Missing board_id, column_id, or title", req.body);
        return res.status(400).json({ message: "Missing board_id, column_id, or title" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO tasks (board_id, column_id, title, description, position) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [board_id, column_id, title, description || "", position || 0]
        );

        res.status(201).json({ message: "Task created successfully", task: result.rows[0] });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * ✅ API ดึง Tasks ตาม Column
 * Method: GET
 * URL: /api/tasks/columns/:column_id
 */
router.get("/columns/:column_id", async (req, res) => {
    const { column_id } = req.params;

    try {
        const result = await pool.query(
            "SELECT task_id, board_id, column_id, title, position FROM tasks WHERE column_id = $1 ORDER BY position",
            [column_id]
        );

        res.json({ tasks: result.rows });
    } catch (error) {
        console.error("❌ Error fetching tasks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * ✅ API อัปเดต Task
 * Method: PUT
 * URL: /api/tasks/:task_id
 * Body: { title, position }
 */
// ✅ API อัปเดต Task
// ตรวจสอบการอัปเดต Task
router.put("/:task_id", async (req, res) => {
    const { task_id } = req.params;
    const { title, description } = req.body;
  
    if (!title || !task_id) {
      return res.status(400).json({ message: "Missing title or task_id" });
    }
  
    console.log(`Updating task with task_id=${task_id}, title=${title}, description=${description}`);  // ตรวจสอบค่าที่ส่งมา
  
    try {
      const result = await pool.query(
        "UPDATE tasks SET title = $1, description = $2 WHERE task_id = $3 RETURNING *",
        [title, description || "", task_id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      res.json({ message: "Task updated successfully", task: result.rows[0] });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

/**
 * ✅ API ลบ Task
 * Method: DELETE
 * URL: /api/tasks/:task_id
 */
router.delete("/:task_id", async (req, res) => {
    const { task_id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM tasks WHERE task_id = $1 RETURNING *",
            [task_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * ✅ API ย้าย Task ไป Column อื่น
 * Method: PUT
 * URL: /api/tasks/:task_id/move
 * Body: { column_id, position }
 */
router.put("/:task_id/move", async (req, res) => {
    const { task_id } = req.params;
    const { column_id, position } = req.body;

    if (!column_id) {
        return res.status(400).json({ message: "Missing column_id" });
    }

    try {
        const result = await pool.query(
            "UPDATE tasks SET column_id = $1, position = $2 WHERE task_id = $3 RETURNING *",
            [column_id, position ?? 0, task_id] // ✅ กำหนดค่า position เป็น 0 ถ้าไม่มี
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task moved successfully", task: result.rows[0] });
    } catch (error) {
        console.error("❌ Error moving task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ API ดึงข้อมูล Task ตาม ID
router.get("/:task_id", async (req, res) => {
    const { task_id } = req.params;

    try {
        const result = await pool.query("SELECT * FROM tasks WHERE task_id = $1", [task_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(result.rows[0]); // ส่งข้อมูล Task กลับไป
    } catch (error) {
        console.error("❌ Error fetching task:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
