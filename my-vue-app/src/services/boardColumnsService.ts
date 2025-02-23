const API_BASE_URL = 'http://localhost:5000/api';
const COLUMN_API = `${API_BASE_URL}/board_columns`;
const BOARD_API = `${API_BASE_URL}/boards`;

interface Column {
  column_id: number;
  column_name: string;
  position: number;
}

// ✅ ฟังก์ชันกลางสำหรับดึง Token (แก้ให้ไม่มี `undefined`)
const getAuthHeaders = (): HeadersInit => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const token = localStorage.getItem("token");
  
    if (!token) {
      console.error("⚠️ No authentication token found! API requests may fail.");
    } else {
      headers.append("Authorization", `Bearer ${token}`);
    }
  
    return headers;
  };
  

// ✅ ฟังก์ชันดึงข้อมูลคอลัมน์ของบอร์ด
export const getColumns = async (boardId: number): Promise<Column[]> => {
  if (!boardId) {
    console.error('Error: boardId is undefined');
    throw new Error('Invalid boardId');
  }
  try {
    console.log(`Fetching columns for boardId=${boardId}`);
    const response = await fetch(`${COLUMN_API}/${boardId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch columns: ${response.status}`);
    }

    const data = await response.json();
    return data.columns;
  } catch (error) {
    console.error('Error fetching columns:', error);
    throw error;
  }
};

// ✅ ฟังก์ชันสร้างคอลัมน์
export const createColumn = async (boardId: number, columnName: string, position: number): Promise<Column> => {
  if (!boardId || !columnName) {
    console.error('Error: Missing boardId or columnName');
    throw new Error('Invalid request: Missing boardId or columnName');
  }
  try {
    console.log(`Creating column in boardId=${boardId}, columnName=${columnName}, position=${position}`);
    const response = await fetch(`${COLUMN_API}/${boardId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ columnName, position }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create column: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating column:', error);
    throw error;
  }
};

// ✅ ฟังก์ชันแก้ไขชื่อคอลัมน์
export const updateColumnName = async (boardId: number, columnId: number, columnName: string): Promise<Column> => {
  if (!boardId || !columnId || !columnName) {
    console.error('Error: Missing boardId, columnId, or columnName');
    throw new Error('Invalid request: Missing parameters');
  }
  try {
    console.log(`Updating column: boardId=${boardId}, columnId=${columnId}, newName=${columnName}`);
    const response = await fetch(`${COLUMN_API}/${boardId}/${columnId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ columnName }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update column: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating column:', error);
    throw error;
  }
};

// ✅ ฟังก์ชันลบคอลัมน์
export const deleteColumn = async (boardId: number, columnId: number): Promise<void> => {
  if (!boardId || !columnId) {
    console.error('Error: Missing boardId or columnId');
    throw new Error('Invalid request: Missing parameters');
  }
  try {
    console.log(`Deleting column: boardId=${boardId}, columnId=${columnId}`);
    const response = await fetch(`${COLUMN_API}/${boardId}/${columnId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete column: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting column:', error);
    throw error;
  }
};

// ✅ ฟังก์ชันดึงชื่อบอร์ด
export const getBoardName = async (boardId: number): Promise<string> => {
    if (!boardId || isNaN(boardId)) {
      console.error('Invalid boardId:', boardId);
      throw new Error('Invalid boardId');
    }
    try {
      console.log(`Fetching board name for boardId=${boardId}`);
      const response = await fetch(`http://localhost:5000/api/boards/${boardId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch board name: ${response.status}`);
      }
  
      const data = await response.json();
      return data.board_name;
    } catch (error) {
      console.error('Error fetching board name:', error);
      throw error;
    }
  };
  