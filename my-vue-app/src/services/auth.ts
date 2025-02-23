import axios from "axios";

// URL สำหรับการเชื่อมต่อ API
const API_URL = "http://localhost:5000/api/auth";

// กำหนดประเภทข้อมูลที่ตอบกลับจาก API
interface AuthResponse {
  token: string;
  user: {
    id: number;        // user_id
    username: string;  // ชื่อผู้ใช้
    email: string;     // อีเมล
  };
}

export const register = async (username: string, email: string, password: string): Promise<void> => {
  await axios.post(`${API_URL}/register`, { username, email, password });
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_URL}/login`, { email, password });
  return response.data;  // ส่งกลับข้อมูล AuthResponse ที่ได้จาก API
};
