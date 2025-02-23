const express = require('express');
const pool = require("../config/db");
const router = express.Router();

// Middleware ตรวจสอบสิทธิ์การเข้าถึง Board
const checkBoardAccess = async (req, res, next) => {
    const { board_id } = req.params;
    const user_id = req.body.user_id || req.query.user_id || req.headers["user_id"];

    if (!user_id) {
        return res.status(400).json({ message: "Missing user_id" });
    }

    try {
        const accessResult = await pool.query(
            `SELECT * FROM boards 
             WHERE board_id = $1 AND owner_id = $2
             UNION 
             SELECT b.* FROM boards b 
             JOIN board_members bm ON b.board_id = bm.board_id 
             WHERE b.board_id = $1 AND bm.user_id = $2`,
            [board_id, user_id]
        );

        if (accessResult.rowCount === 0) {
            return res.status(403).json({ message: "Access denied" });
        }

        next();
    } catch (error) {
        console.error("Error checking access:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Middleware ตรวจสอบว่าเป็นเจ้าของ Board
const checkBoardOwner = async (req, res, next) => {
    const { board_id } = req.params;
    const user_id = req.body.user_id || req.query.user_id || req.headers["user_id"];

    if (!user_id) {
        return res.status(400).json({ message: "Missing user_id" });
    }

    try {
        const ownerCheck = await pool.query(
            "SELECT owner_id FROM boards WHERE board_id = $1",
            [board_id]
        );

        if (ownerCheck.rowCount === 0) {
            return res.status(404).json({ message: "Board not found" });
        }

        if (String(ownerCheck.rows[0].owner_id) !== String(user_id)) {
            return res.status(403).json({ message: "You are not the owner of this board" });
        }

        next();
    } catch (error) {
        console.error("Error checking board owner:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET Boards ที่ User เป็นเจ้าของ และเป็นสมาชิก
router.get("/users/:user_id/boards", async (req, res) => {
    const { user_id } = req.params;

    try {
        const ownedBoards = await pool.query(
            "SELECT * FROM boards WHERE owner_id = $1",
            [user_id]
        );

        const memberBoards = await pool.query(
            `SELECT b.* FROM boards b
             JOIN board_members bm ON b.board_id = bm.board_id
             WHERE bm.user_id = $1`,
            [user_id]
        );

        res.status(200).json({
            ownedBoards: ownedBoards.rows,
            memberBoards: memberBoards.rows
        });
    } catch (error) {
        console.error("Error fetching boards:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create Board พร้อมเพิ่มคอลัมน์เริ่มต้น
router.post("/boards", async (req, res) => {
    const { board_name, owner_id } = req.body;
    
    if (!board_name || !owner_id) {
        return res.status(400).json({ message: "Missing board_name or owner_id" });
    }

    try {
        await pool.query("BEGIN");

        const boardResult = await pool.query(
            "INSERT INTO boards (board_name, owner_id) VALUES ($1, $2) RETURNING board_id",
            [board_name, owner_id]
        );
        const board_id = boardResult.rows[0].board_id;

        const columns = ["To Do", "In Progress", "Done"];
        for (let i = 0; i < columns.length; i++) {
            await pool.query(
                "INSERT INTO board_columns (board_id, column_name, position) VALUES ($1, $2, $3)",
                [board_id, columns[i], i]
            );
        }

        await pool.query("COMMIT");

        res.status(201).json({ message: "Board created successfully", board_id });
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update Board Name
router.put("/boards/:board_id", checkBoardOwner, async (req, res) => {
    const { board_id } = req.params;
    const { board_name, user_id } = req.body;

    if (!board_name || !user_id) {
        return res.status(400).json({ message: "Missing board_name or user_id" });
    }

    try {
        const result = await pool.query(
            "UPDATE boards SET board_name = $1 WHERE board_id = $2 RETURNING *",
            [board_name, board_id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Board not found" });
        }

        res.status(200).json({ message: "Board updated successfully", board: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete Board
router.delete("/boards/:board_id", checkBoardOwner, async (req, res) => {
    const { board_id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM boards WHERE board_id = $1 RETURNING *",
            [board_id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Board not found" });
        }

        res.status(200).json({ message: "Board deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ API GET บอร์ดตาม `board_id`
router.get("/:board_id", async (req, res) => {
    const { board_id } = req.params;
    console.log(`🔍 Fetching board data for board_id=${board_id}`);

    try {
        const result = await pool.query("SELECT board_name FROM boards WHERE board_id = $1", [req.params.board_id]);


        if (result.rows.length === 0) {
            console.error("🚨 Board not found:", board_id);
            return res.status(404).json({ message: "Board not found" });
        }

        console.log(`✅ Found board: ${result.rows[0].board_name}`);
        res.json({ board_name: result.rows[0].board_name });
    } catch (error) {
        console.error("❌ Error fetching board name:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



module.exports = router;