const API_BASE_URL = "http://localhost:5000/api/tasks";

// ✅ ดึง Tasks ตาม `column_id`
export const getTasks = async (columnId: number) => {
  try {
    console.log(`Fetching tasks for columnId=${columnId}`); // ✅ Debugging
    const response = await fetch(`${API_BASE_URL}/columns/${columnId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching tasks:", errorData);
      throw new Error("Failed to fetch tasks");
    }

    const data = await response.json();
    return data.tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

// ✅ เพิ่ม Task ใหม่
export const createTask = async (boardId: number, columnId: number, title: string, description: string = "") => {
  if (!boardId || !columnId || !title) {
    console.error("❌ Error: Missing boardId, columnId, or title", { boardId, columnId, title });
    throw new Error("Missing boardId, columnId, or title");
  }

  console.log("✅ Sending data to API:", { boardId, columnId, title });

  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board_id: boardId, column_id: columnId, title, description, position: 0 }),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("❌ API Error:", errorResponse);
      throw new Error(errorResponse.message || "Failed to create task");
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error creating task:", error);
    throw error;
  }
};

// ✅ อัปเดต Task (ชื่อ + คำอธิบาย)
export const updateTask = async (taskId: number, title: string, description: string = "") => {
  if (!taskId || !title) {
    console.error("❌ Error: Missing taskId or title", { taskId, title });
    throw new Error("Missing taskId or title");
  }

  // หาก description เป็น undefined หรือ null ให้เป็นค่าว่าง (""), และ log ข้อมูลที่ได้รับ
  description = description || "";  // กำหนดค่าให้กับ description

  console.log(`✅ Updating task: taskId=${taskId}, title=${title}, description=${description}`); // ✅ Debugging

  try {
    const response = await fetch(`${API_BASE_URL}/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),  // ส่งข้อมูล title และ description
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error updating task:", errorData);
      throw new Error("Failed to update task");
    }

    return await response.json();  // ส่งคืนข้อมูลที่ได้รับจาก backend
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};


// ✅ ลบ Task
export const deleteTask = async (taskId: number) => {
  if (!taskId) {
    console.error("❌ Error: Missing taskId");
    throw new Error("Missing taskId");
  }

  try {
    console.log(`✅ Deleting task: taskId=${taskId}`); // ✅ Debugging
    
    const response = await fetch(`${API_BASE_URL}/${taskId}`, { method: "DELETE" });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error deleting task:", errorData);
      throw new Error("Failed to delete task");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// ✅ ย้าย Task ไป Column อื่น
export const moveTask = async (taskId: number, newColumnId: number, position: number = 0) => {
  if (!taskId || !newColumnId) {
    console.error("❌ Error: Missing taskId or newColumnId", { taskId, newColumnId });
    throw new Error("Missing taskId or newColumnId");
  }

  console.log(`✅ Moving task: taskId=${taskId}, newColumnId=${newColumnId}, position=${position}`); // ✅ Debugging
  
  try {
    const response = await fetch(`${API_BASE_URL}/${taskId}/move`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ column_id: newColumnId, position }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error moving task:", errorData);
      throw new Error("Failed to move task");
    }

    return await response.json();
  } catch (error) {
    console.error("Error moving task:", error);
    throw error;
  }
};
