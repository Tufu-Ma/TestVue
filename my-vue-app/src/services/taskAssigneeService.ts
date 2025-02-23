import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // URL ของ API ของคุณ

/**
 * ฟังก์ชันในการเพิ่ม Assignee
 * @param boardId - ID ของบอร์ด
 * @param taskId - ID ของ Task
 * @param userId - ID ของผู้ใช้ที่ต้องการเพิ่มเป็น Assignee
 */
export const assignUserToTask = async (boardId: number, taskId: number, userId: number): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('User is not authenticated. Please log in.');
    }

    try {
        const response = await axios.post(
            `${API_URL}/boards/${boardId}/tasks/${taskId}/assign`,
            { userId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(response.data.message);
    } catch (error: any) {
        const errorMessage = error.response?.data.message || error.message;
        console.error('Failed to assign user:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * ฟังก์ชันในการลบ Assignee ออกจาก Task
 * @param boardId - ID ของบอร์ด
 * @param taskId - ID ของ Task
 * @param userId - ID ของผู้ใช้ที่ต้องการลบออกจาก Assignee
 */
export const unassignUserFromTask = async (boardId: number, taskId: number, userId: number): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('User is not authenticated. Please log in.');
    }

    try {
        const response = await axios.delete(
            `${API_URL}/boards/${boardId}/tasks/${taskId}/unassign/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(response.data.message);
    } catch (error: any) {
        const errorMessage = error.response?.data.message || error.message;
        console.error('Failed to unassign user:', errorMessage);
        throw new Error(errorMessage);
    }
};

/**
 * ฟังก์ชันในการดึงรายชื่อ Assignees ของ Task
 * @param taskId - ID ของ Task
 * @returns รายชื่อ Assignees
 */
export const getAssigneesOfTask = async (boardId: number, taskId: number): Promise<any[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('User is not authenticated. Please log in.');
    }

    try {
        const response = await axios.get(`${API_URL}/boards/${boardId}/tasks/${taskId}/assignees`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        const errorMessage = error.response?.data.message || error.message;
        console.error('Failed to fetch assignees:', errorMessage);
        throw new Error(errorMessage);
    }
};
