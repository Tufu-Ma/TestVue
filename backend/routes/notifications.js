const express = require('express');
const pool = require("../config/db"); // ใช้เส้นทางที่ถูกต้อง
const router = express.Router();

// API: ดึงการแจ้งเตือนทั้งหมด
router.get('/', async (req, res) => {  // ใช้ '/' แทน '/api/notifications'
  try {
    const result = await pool.query('SELECT * FROM Notifications ORDER BY created_at DESC');
    res.status(200).json(result.rows); // ส่งข้อมูลการแจ้งเตือนทั้งหมดในรูปแบบ JSON
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// API: ดึงการแจ้งเตือนสำหรับผู้ใช้ที่กำหนด
router.get('/user/:userId', async (req, res) => {  // ใช้ '/' แทน '/api/notifications/user'
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM Notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.status(200).json(result.rows); // ส่งข้อมูลการแจ้งเตือนสำหรับผู้ใช้
  } catch (err) {
    console.error('Error fetching notifications for user:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// API: ดูการแจ้งเตือนแต่ละรายการ
router.get('/:id', async (req, res) => {  // ใช้ '/' แทน '/api/notifications/:id'
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Notifications WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.status(200).json(result.rows[0]); // ส่งข้อมูลการแจ้งเตือนที่ตรงกับ id
  } catch (err) {
    console.error('Error fetching notification by id:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// API: ลบการแจ้งเตือน
router.delete('/:id', async (req, res) => {  // ใช้ '/' แทน '/api/notifications/:id'
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Notifications WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// API: Mark as read (อ่านแล้ว)
router.put('/:id/read', async (req, res) => {  // ใช้ '/' แทน '/api/notifications/:id/read'
  const { id } = req.params;
  try {
    const result = await pool.query('UPDATE Notifications SET is_read = TRUE WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification marked as read', notification: result.rows[0] });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;
