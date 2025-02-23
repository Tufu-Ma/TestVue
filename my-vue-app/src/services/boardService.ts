import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface Board {
  board_id: number;
  board_name: string;
  owner_id: number;
}

const boardService = {
  // ✅ สร้าง Board ใหม่
  async createBoard(board_name: string, owner_id: number) {
    try {
      const response = await axios.post(`${API_BASE_URL}/boards`, {
        board_name,
        owner_id,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ แก้ไขชื่อ Board (ต้องส่ง user_id)
  async updateBoard(board_id: number, board_name: string) {
    try {
        const userId = localStorage.getItem("user_id"); // ✅ ดึง user_id
        if (!userId) {
            throw new Error("User ID is missing. Please log in.");
        }
        
        const response = await axios.put(`${API_BASE_URL}/boards/${board_id}`, {
            board_name,
            user_id: userId, // ✅ ส่ง user_id ไปด้วย
        });

        return response.data;
    } catch (error) {
        throw error;
    }
},

  // ✅ ลบ Board (ต้องส่ง user_id ผ่าน `data`)
  async deleteBoard(board_id: number, user_id: number) {
    try {
        const response = await axios.delete(`${API_BASE_URL}/boards/${board_id}`, {
            headers: { user_id: String(user_id) }, // ✅ ส่ง user_id ผ่าน Headers
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}
};

export default boardService;
