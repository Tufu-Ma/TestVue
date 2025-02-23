import axios, { AxiosError, AxiosResponse } from 'axios';

// 🔥 URL ของ API แจ้งเตือน (ตรวจสอบให้ตรงกับ Backend)
const API_URL = 'http://localhost:5000/api/notifications';

// 🔥 กำหนดประเภทข้อมูลสำหรับการแจ้งเตือน
export interface Notification {
  notification_id: number;  // เปลี่ยนจาก id → notification_id
  user_id: number;
  task_id?: number | null;  // อนุญาตให้เป็น null ได้ ถ้าไม่มี task
  board_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ✅ ฟังก์ชันช่วยดึง Token สำหรับ Authentication
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ✅ ดึงข้อมูลการแจ้งเตือนทั้งหมด
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response: AxiosResponse<Notification[]> = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    throw error;
  }
};

// ✅ ดึงการแจ้งเตือนของผู้ใช้ที่กำหนด
export const getNotificationsByUser = async (userId: number): Promise<Notification[]> => {
  try {
    const response: AxiosResponse<Notification[]> = await axios.get(`${API_URL}/user/${userId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching notifications for user:', error);
    throw error;
  }
};

// ✅ ดึงการแจ้งเตือนของ Task ที่กำหนด
export const getNotificationsByTask = async (taskId: number): Promise<Notification[]> => {
  try {
    const response: AxiosResponse<Notification[]> = await axios.get(`${API_URL}/task/${taskId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching notifications for task:', error);
    throw error;
  }
};

// ✅ ดึงการแจ้งเตือนของ Board ที่กำหนด
export const getNotificationsByBoard = async (boardId: number): Promise<Notification[]> => {
  try {
    const response: AxiosResponse<Notification[]> = await axios.get(`${API_URL}/board/${boardId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching notifications for board:', error);
    throw error;
  }
};

// ✅ ดึงการแจ้งเตือนแต่ละรายการโดยใช้ ID
export const getNotificationById = async (notificationId: number): Promise<Notification> => {
  try {
    const response: AxiosResponse<Notification> = await axios.get(`${API_URL}/${notificationId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching notification by id:', error);
    throw error;
  }
};

// ✅ เพิ่ม Notification ใหม่ (เมื่อมี Assignee หรือเหตุการณ์อื่น ๆ)
export const createNotification = async (
  userId: number,
  taskId: number | null,
  boardId: number,
  message: string
): Promise<Notification> => {
  try {
    console.log("📩 Creating notification with data:", { userId, taskId, boardId, message });

    const response: AxiosResponse<Notification> = await axios.post(
      API_URL,
      { user_id: userId, task_id: taskId, board_id: boardId, message: message },
      getAuthHeaders()
    );

    console.log("✅ Notification saved in database:", response.data);
    return response.data;
  } catch (error: unknown) {
    // ✅ ตรวจสอบว่า error เป็น AxiosError หรือไม่
    if (error instanceof AxiosError) {
      console.error("❌ AxiosError creating notification:", error.response?.data || error.message);
    } else {
      console.error("❌ Unknown error creating notification:", error);
    }
    throw error;
  }
};

// ✅ ทำเครื่องหมายว่าอ่านแล้ว
export const markAsRead = async (notificationId: number): Promise<Notification> => {
  try {
    const response: AxiosResponse<Notification> = await axios.put(
      `${API_URL}/${notificationId}/read`,
      {},
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
};

// ✅ ลบการแจ้งเตือน
export const deleteNotification = async (notificationId?: number): Promise<{ success: boolean; message: string }> => {
  if (!notificationId) {
    console.error("❌ Error: notificationId is undefined!");
    throw new Error("Invalid notification ID");
  }

  try {
    console.log(`🗑️ Deleting notification with ID: ${notificationId}`);
    const response: AxiosResponse<{ success: boolean; message: string }> = await axios.delete(
      `${API_URL}/${notificationId}`,
      getAuthHeaders()
    );

    console.log("✅ Notification deleted:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting notification:", error);
    throw error;
  }
};

