// src/services/notificationService.ts
import axios, { AxiosResponse } from 'axios';

// URL ของ API สำหรับแจ้งเตือน
const API_URL = 'http://localhost:5000/api/notifications';  // แก้ไข URL ให้ตรงกับ backend

// กำหนดประเภทข้อมูลสำหรับการแจ้งเตือน
interface Notification {
  id: number;
  user_id: number;
  task_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ฟังก์ชันในการดึงข้อมูลการแจ้งเตือนทั้งหมด
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response: AxiosResponse<Notification[]> = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// ฟังก์ชันในการดึงการแจ้งเตือนของผู้ใช้ที่กำหนด
export const getNotificationsByUser = async (userId: number): Promise<Notification[]> => {
  try {
    const response: AxiosResponse<Notification[]> = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications for user:', error);
    throw error;
  }
};

// ฟังก์ชันในการดึงการแจ้งเตือนแต่ละรายการ
export const getNotificationById = async (id: number): Promise<Notification> => {
  try {
    const response: AxiosResponse<Notification> = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification by id:', error);
    throw error;
  }
};

// ฟังก์ชันในการทำเครื่องหมายว่าอ่านแล้ว
export const markAsRead = async (id: number): Promise<Notification> => {
  try {
    const response: AxiosResponse<Notification> = await axios.put(`${API_URL}/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// ฟังก์ชันในการลบการแจ้งเตือน
export const deleteNotification = async (id: number): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ message: string }> = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};
