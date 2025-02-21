// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

const router = express.Router();

// REGISTER API
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
  
    // ตรวจสอบว่ามีค่าหรือไม่
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }
  
    try {
      // ตรวจสอบว่าผู้ใช้มีอยู่แล้วหรือไม่
      const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }
  
      // เข้ารหัสรหัสผ่าน
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // บันทึกผู้ใช้ใหม่ลงในฐานข้อมูล
      const newUser = await pool.query(
        "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
        [username, email, hashedPassword]
      );
  
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).send("Server Error");
    }
  });
  

// LOGIN API
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
  
    try {
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  
      if (user.rows.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }
  
      const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }
  
      const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email } });
  
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).send("Server Error");
    }
  });
  

module.exports = router;
