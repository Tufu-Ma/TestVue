const express = require("express");
const pool = require("../config/db");
const router = express.Router();
const jwt = require("jsonwebtoken");

// ✅ Middleware: ตรวจสอบ JWT Token (Authentication)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { user_id: decoded.userId };
        next();
    } catch (error) {
        console.error("❌ Invalid token:", error);
        return res.status(403).json({ success: false, message: "Forbidden: Invalid token" });
    }
};

/**
 * ✅ ดึง User เข้า Task (เชิญ Assignee ผ่านอีเมล)
 */
router.post("/:board_id/tasks/:task_id/invite", authenticateToken, async (req, res) => {
    const { task_id } = req.params;
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "User email is required" });
    }

    try {
        // ✅ ค้นหา user_id จากอีเมล
        const userCheck = await pool.query("SELECT user_id FROM users WHERE email = $1", [email]);
        if (userCheck.rowCount === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const userId = userCheck.rows[0].user_id;

        // ✅ ตรวจสอบว่า Task มีอยู่จริง
        const taskCheck = await pool.query("SELECT board_id FROM tasks WHERE task_id = $1", [task_id]);
        if (taskCheck.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }
        const boardId = taskCheck.rows[0].board_id;

        // ✅ ตรวจสอบว่า User ถูกเพิ่มเป็น Assignee แล้วหรือยัง
        const checkExistingAssignee = await pool.query(
            "SELECT * FROM task_assignees WHERE task_id = $1 AND user_id = $2",
            [task_id, userId]
        );

        if (checkExistingAssignee.rowCount > 0) {
            return res.status(409).json({ success: false, message: "User is already assigned to this task" });
        }

        // ✅ เพิ่ม User เป็น Assignee ของ Task
        await pool.query("INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)", [task_id, userId]);

        res.status(201).json({ success: true, message: "User invited successfully", assignee_id: userId });

    } catch (error) {
        console.error("❌ Invite Assignee Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

/**
 * ✅ ลบ Assignee ออกจาก Task
 */
router.delete("/:board_id/tasks/:task_id/unassign/:user_id", authenticateToken, async (req, res) => {
    const { task_id, user_id } = req.params;

    try {
        const result = await pool.query("DELETE FROM task_assignees WHERE task_id = $1 AND user_id = $2", [task_id, user_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Assignee not found for this task" });
        }

        res.json({ success: true, message: "User unassigned successfully" });
    } catch (error) {
        console.error("❌ Error unassigning user:", error);
        res.status(500).json({ success: false, message: "Failed to unassign user" });
    }
});

/**
 * ✅ ให้ Assignee ออกจาก Task ได้ด้วยตัวเอง
 */
router.delete("/tasks/:task_id/unassign-self", authenticateToken, async (req, res) => {
    const { task_id } = req.params;
    const user_id = req.user.user_id;

    try {
        const result = await pool.query("DELETE FROM task_assignees WHERE task_id = $1 AND user_id = $2", [task_id, user_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "You are not assigned to this task" });
        }

        res.json({ success: true, message: "You have been removed from the task" });
    } catch (error) {
        console.error("❌ Error leaving task:", error);
        res.status(500).json({ success: false, message: "Failed to leave task" });
    }
});

/**
 * ✅ ดึงรายชื่อ Assignees ของ Task
 */
router.get("/:task_id/assignees", authenticateToken, async (req, res) => {
    const { task_id } = req.params;

    try {
        const assignees = await pool.query(
            "SELECT users.user_id, users.name FROM task_assignees INNER JOIN users ON task_assignees.user_id = users.user_id WHERE task_assignees.task_id = $1",
            [task_id]
        );

        res.json({ success: true, assignees: assignees.rows });
    } catch (error) {
        console.error("❌ Error fetching assignees:", error);
        res.status(500).json({ success: false, message: "Failed to fetch assignees" });
    }
});

module.exports = router;
