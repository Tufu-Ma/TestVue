const express = require("express");
const pool = require("../config/db");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Middleware ตรวจสอบ JWT Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("📌 Decoded Token:", decoded); // ✅ Log Payload

        req.user = { user_id: decoded.userId }; // ✅ ใช้ `userId` จาก Token
        console.log("✅ Token verified! User ID:", req.user.user_id);

        next();
    } catch (error) {
        console.error("❌ Invalid token:", error);
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};



// ✅ API เชิญสมาชิกเข้าสู่บอร์ด (เฉพาะเจ้าของบอร์ดเท่านั้น)
router.post("/boards/:board_id/invite", authenticateToken, async (req, res) => {
    console.log("📌 Received request at /boards/:board_id/invite");
    console.log("📌 Request Body:", req.body);
    console.log("📌 User ID from Token:", req.user.user_id); // user ที่ login อยู่

    const { board_id } = req.params;
    const { email, owner_id } = req.body;

    if (!email || !owner_id) {
        return res.status(400).json({ message: "Missing required fields: email or owner_id" });
    }

    try {
        // ✅ เช็คว่า owner_id ตรงกับ user ที่ส่ง request หรือไม่
        if (Number(owner_id) !== Number(req.user.user_id)) {
            console.warn(`⚠️ owner_id (${owner_id}) ไม่ตรงกับ user_id (${req.user.user_id})`);
            return res.status(403).json({ message: "You do not have permission to invite users" });
        }

        // ✅ ตรวจสอบว่า user เป็นเจ้าของบอร์ดหรือไม่
        const ownerCheck = await pool.query("SELECT owner_id FROM boards WHERE board_id = $1", [board_id]);

        if (ownerCheck.rowCount === 0) {
            return res.status(404).json({ message: "Board not found" });
        }

        if (ownerCheck.rows[0].owner_id !== Number(owner_id)) {
            console.warn(`⚠️ User ${owner_id} is not the owner of board ${board_id}.`);
            return res.status(403).json({ message: "Only the board owner can invite users" });
        }

        // ✅ ค้นหา user_id จาก email
        const userResult = await pool.query("SELECT user_id FROM users WHERE email = $1", [email]);

        if (userResult.rowCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user_id = userResult.rows[0].user_id;

        // ✅ ตรวจสอบว่า user เป็นสมาชิกอยู่แล้วหรือไม่
        const memberCheck = await pool.query("SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2", [board_id, user_id]);

        if (memberCheck.rowCount > 0) {
            return res.status(409).json({ message: "User is already a member of this board" });
        }

        // ✅ เพิ่ม user เป็นสมาชิกของบอร์ด
        await pool.query("INSERT INTO board_members (board_id, user_id) VALUES ($1, $2)", [board_id, user_id]);

        res.status(201).json({ message: "User invited successfully" });

    } catch (error) {
        console.error("❌ Invite Member Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
