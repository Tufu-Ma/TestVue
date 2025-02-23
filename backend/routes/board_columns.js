const express = require("express");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Middleware ตรวจสอบความเป็นเจ้าของบอร์ด
const checkBoardOwnership = async (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No token provided in Authorization header");
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
  
    const token = authHeader.split(" ")[1];
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Decoded JWT:", decoded);
  
      // 🔥 ตรวจสอบว่ามี userId หรือไม่
      const userId = decoded.userId || decoded.user_id; // ✅ รองรับทั้ง userId และ user_id
      if (!userId) {
        console.log("❌ userId is undefined in JWT payload:", decoded);
        return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
      }
  
      const { boardId, columnId } = req.params;
  
      // 🔥 ตรวจสอบ `boardId`
      const boardIdInt = parseInt(boardId);
      if (isNaN(boardIdInt)) {
        console.log("❌ Invalid boardId:", boardId);
        return res.status(400).json({ message: "Invalid boardId" });
      }
  
      console.log(`Checking ownership for boardId: ${boardIdInt}, columnId: ${columnId}, userId: ${userId}`);
  
      // ✅ ตรวจสอบว่าผู้ใช้เป็นเจ้าของบอร์ด
      const boardResult = await pool.query(
        "SELECT owner_id FROM boards WHERE board_id = $1",
        [boardIdInt]
      );
  
      if (boardResult.rows.length === 0) {
        console.log(`❌ Board not found: boardId=${boardIdInt}`);
        return res.status(404).json({ message: "Board not found" });
      }
  
      if (boardResult.rows[0].owner_id !== userId) {
        console.log(`❌ Permission denied: userId=${userId} is not the owner of boardId=${boardIdInt}`);
        return res.status(403).json({ message: "Permission denied: You are not the owner of this board" });
      }
  
      // ✅ ถ้ามี columnId → ตรวจสอบว่าเป็นของบอร์ดนี้จริงหรือไม่
      if (columnId) {
        const columnIdInt = parseInt(columnId);
        if (isNaN(columnIdInt)) {
          console.log("❌ Invalid columnId:", columnId);
          return res.status(400).json({ message: "Invalid columnId" });
        }
  
        const columnResult = await pool.query(
          "SELECT board_id FROM board_columns WHERE column_id = $1",
          [columnIdInt]
        );
  
        if (columnResult.rows.length === 0) {
          console.log(`❌ Column not found: columnId=${columnIdInt}`);
          return res.status(404).json({ message: "Column not found" });
        }
  
        if (columnResult.rows[0].board_id !== boardIdInt) {
          console.log(`❌ Column ${columnIdInt} does not belong to board ${boardIdInt}`);
          return res.status(403).json({ message: "Permission denied: Column does not belong to this board" });
        }
      }
  
      next();
    } catch (error) {
      console.error("❌ Authorization check failed:", error);
      return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
  };
  

// ✅ ดึงข้อมูลคอลัมน์ของบอร์ด
router.get("/:boardId", async (req, res) => {
  const { boardId } = req.params;

  const boardIdInt = parseInt(boardId);
  if (isNaN(boardIdInt)) {
    return res.status(400).json({ message: "Invalid boardId" });
  }

  try {
    const query = `
      SELECT column_id, column_name, position
      FROM board_columns
      WHERE board_id = $1
      ORDER BY position;
    `;
    const result = await pool.query(query, [boardIdInt]);

    res.json({ columns: result.rows });
  } catch (error) {
    console.error("Error fetching board columns:", error);
    res.status(500).json({ message: error.message || "Error fetching board columns" });
  }
});

// ✅ สร้างคอลัมน์ใหม่ (เฉพาะเจ้าของบอร์ดเท่านั้น)
router.post("/:boardId", checkBoardOwnership, async (req, res) => {
  const { boardId } = req.params;
  const { columnName, position } = req.body;

  if (!columnName || position == null) {
    return res.status(400).json({ message: "Missing columnName or position" });
  }

  try {
    const query = `
      INSERT INTO board_columns (board_id, column_name, position)
      VALUES ($1, $2, $3)
      RETURNING column_id, column_name, position;
    `;
    const result = await pool.query(query, [parseInt(boardId), columnName, position]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating column:", error);
    res.status(500).json({ message: error.message || "Error creating column" });
  }
});

// ✅ แก้ไขชื่อคอลัมน์
router.put("/:boardId/:columnId", checkBoardOwnership, async (req, res) => {
  const { boardId, columnId } = req.params;
  const { columnName } = req.body;

  if (!columnName) {
    return res.status(400).json({ message: "Missing columnName" });
  }

  try {
    const query = `
      UPDATE board_columns 
      SET column_name = $1 
      WHERE column_id = $2 AND board_id = $3
      RETURNING column_id, column_name;
    `;
    const result = await pool.query(query, [columnName, parseInt(columnId), parseInt(boardId)]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Column not found or does not belong to the specified board" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating column:", error);
    res.status(500).json({ message: error.message || "Error updating column" });
  }
});

// ✅ ลบคอลัมน์
router.delete("/:boardId/:columnId", checkBoardOwnership, async (req, res) => {
  const { boardId, columnId } = req.params;

  try {
    const query = `
      DELETE FROM board_columns 
      WHERE column_id = $1 AND board_id = $2
      RETURNING column_id;
    `;
    const result = await pool.query(query, [parseInt(columnId), parseInt(boardId)]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Column not found or does not belong to the specified board" });
    }

    res.status(200).json({ message: "Column deleted successfully" });
  } catch (error) {
    console.error("Error deleting column:", error);
    res.status(500).json({ message: error.message || "Error deleting column" });
  }
});

// ✅ ดึงชื่อบอร์ด (แก้ Route เพื่อไม่ให้ซ้ำกัน)
router.get("/name/:boardId", async (req, res) => {
  const { boardId } = req.params;

  try {
    const result = await pool.query(
      "SELECT board_name FROM boards WHERE board_id = $1",
      [parseInt(boardId)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Board not found" });
    }

    res.json({ board_name: result.rows[0].board_name });
  } catch (error) {
    console.error("Error fetching board name:", error);
    res.status(500).json({ message: "Error fetching board name" });
  }
});

module.exports = router;
