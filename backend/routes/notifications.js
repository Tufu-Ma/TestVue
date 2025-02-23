const express = require('express');
const pool = require("../config/db"); // ใช้เส้นทางที่ถูกต้อง
const router = express.Router();

// API: ดึงการแจ้งเตือนทั้งหมด
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Notifications ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// API: ดึงการแจ้งเตือนสำหรับผู้ใช้ที่กำหนด
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM Notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching notifications for user:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// API: ดึงการแจ้งเตือนของ Task และ Board ที่กำหนด
router.get('/task/:taskId', async (req, res) => {
  const { taskId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM Notifications WHERE task_id = $1 ORDER BY created_at DESC',
      [taskId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching notifications for task:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

router.get('/board/:boardId', async (req, res) => {
  const { boardId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM Notifications WHERE board_id = $1 ORDER BY created_at DESC',
      [boardId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching notifications for board:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// API: ดูการแจ้งเตือนแต่ละรายการ
router.get('/:notificationId', async (req, res) => {
  const { notificationId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Notifications WHERE notification_id = $1', [notificationId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching notification by id:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// API: เพิ่ม Notification ใหม่
router.post('/', async (req, res) => {
  const { user_id, task_id, board_id, message } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO Notifications (user_id, task_id, board_id, message, is_read, created_at)
       VALUES ($1, $2, $3, $4, FALSE, NOW()) RETURNING *`,
      [user_id, task_id, board_id, message]
    );

    res.status(201).json({ success: true, notification: result.rows[0] });

  } catch (err) {
    console.error("Error inserting notification:", err);
    res.status(500).json({ error: "Database insert failed" });
  }
});

// API: ลบการแจ้งเตือน
router.delete('/:notificationId', async (req, res) => {
  const { notificationId } = req.params;

  if (!notificationId) {
    return res.status(400).json({ success: false, message: "Invalid notification ID" });
  }

  try {
    const result = await pool.query('DELETE FROM Notifications WHERE notification_id = $1', [notificationId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting notification:', err);
    res.status(500).json({ success: false, message: 'Database query failed' });
  }
});


// API: Mark as read (อ่านแล้ว)
router.put('/:notificationId/read', async (req, res) => {
  const { notificationId } = req.params;
  try {
    const result = await pool.query('UPDATE Notifications SET is_read = TRUE WHERE notification_id = $1 RETURNING *', [notificationId]);
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
