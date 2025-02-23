const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

const router = express.Router();

// ✅ REGISTER API
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email, and password are required" });
  }

  try {
    // ✅ ตรวจสอบว่าผู้ใช้มีอยู่แล้วหรือไม่
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    // ✅ เข้ารหัสรหัสผ่าน
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ บันทึกผู้ใช้ใหม่ลงในฐานข้อมูล
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email",
      [username, email, hashedPassword]
    );

    // ✅ สร้าง Token หลังจากลงทะเบียนสำเร็จ
    const token = jwt.sign(
      { userId: newUser.rows[0].user_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: newUser.rows[0], // ✅ ส่งข้อมูล user กลับไป
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).send("Server Error");
  }
});

// ✅ LOGIN API
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await pool.query(
      "SELECT user_id, username, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ ตรวจสอบรหัสผ่าน
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ✅ สร้าง JWT Token
    const token = jwt.sign(
      { userId: user.rows[0].user_id }, // ✅ ใช้ user_id ที่ถูกต้อง
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.rows[0].user_id,
        username: user.rows[0].username,
        email: user.rows[0].email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
