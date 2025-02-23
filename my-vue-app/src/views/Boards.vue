<template>
    <Navbarlogin />
    <div class="container mt-4">
      <!-- ชื่อบอร์ด -->
      <div class="d-flex justify-content-between align-items-center">
        <h2 class="mb-4">{{ boardName ? `Board: ${boardName}` : 'Loading board...' }}</h2>
        <div class="text-end">
          <button @click="promptNewColumn" class="btn btn-success">
            <i class="bi bi-plus-lg"></i> Add Column
          </button>
        </div>
      </div>
  
      <!-- ✅ ปรับคอลัมน์ให้อยู่ตรงกลาง -->
      <div class="d-flex justify-content-center overflow-auto pb-3">
        <div class="d-flex flex-nowrap gap-4">
          <div 
            v-for="col in columns" 
            :key="col.column_id" 
            class="column card p-3 shadow-sm"
            @dragover.prevent
            @drop="handleDrop(col.column_id)"
          >
            <div class="d-flex justify-content-between align-items-center mb-2">
              <input v-if="col.editing" v-model="col.column_name" type="text" class="form-control" />
              <h5 v-else class="card-title text-success">{{ col.column_name }}</h5>
              <div>
                <button v-if="!col.editing" @click="col.editing = true" class="btn btn-warning btn-sm me-2">Edit</button>
                <button v-if="col.editing" @click="handleUpdateColumn(col)" class="btn btn-success btn-sm me-2">Save</button>
                <button @click="confirmDelete(col.column_id)" class="btn btn-danger btn-sm">
                  <i class="bi bi-x-circle"></i>
                </button>
              </div>
            </div>
  
            <!-- ปุ่มเพิ่ม Task -->
            <button @click="promptNewTask(col.column_id)" class="btn btn-success btn-sm w-100 mb-3">
              <i class="bi bi-plus-lg"></i> Add Task
            </button>
  
            <!-- 🔥 แสดง Task -->
            <ul class="list-unstyled">
              <li 
                v-for="task in col.tasks" 
                :key="task.task_id" 
                class="task-card shadow-sm d-flex align-items-center"
                draggable="true"
                @dragstart="startDrag(task.task_id)"
              >
                <span class="fw-bold flex-grow-1">{{ task.title }}</span>
                <div class="d-flex ms-auto"> <!-- ✅ ใช้ ms-auto ให้ปุ่มไปทางขวา -->
                  <button @click="editTask(task)" class="btn btn-warning btn-sm me-2">✏️</button>
                  <button @click="deleteTask(task.task_id)" class="btn btn-danger btn-sm me-2">❌</button>
                  <button @click="inviteAssigneeToTask(task)" class="btn btn-info btn-sm">
                    Invite Assignee
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { useRoute } from "vue-router";
  import { getBoardName, getColumns, createColumn, updateColumnName, deleteColumn } from "../services/boardColumnsService";
  import { getTasks, createTask, updateTask, moveTask } from "../services/taskService";
  import { deleteTask as deleteTaskFromService } from "../services/taskService"; 
  import Swal from "sweetalert2";
  import Navbarlogin from "@/components/Navbar-login.vue";
  import axios from 'axios';
  import { createNotification } from '../services/notificationService'; // ✅ Import Notification Service

  export default {
    components: { Navbarlogin },
    setup() {
      const route = useRoute();
      const boardId = ref(route.params.boardId);
      const boardName = ref('');
      const columns = ref([]);
      const draggedTaskId = ref(null);
  
      // ✅ โหลดชื่อบอร์ด
      const fetchBoardName = async () => {
        if (!boardId.value) return;
        try {
          boardName.value = await getBoardName(boardId.value);
        } catch (error) {
          console.error('Failed to fetch board name:', error);
        }
      };
  
      // ✅ โหลดคอลัมน์และ Task
      const fetchColumns = async () => {
        if (!boardId.value) return;
        try {
          columns.value = await getColumns(boardId.value);
          for (const col of columns.value) {
            col.tasks = await getTasks(col.column_id);
          }
        } catch (error) {
          console.error('Failed to fetch columns:', error);
        }
      };
  
      // ✅ เพิ่ม Column
      const promptNewColumn = async () => {
        const { value: columnName } = await Swal.fire({
          title: 'Enter column name',
          input: 'text',
          showCancelButton: true,
          confirmButtonText: 'Add Column',
          inputValidator: (value) => (!value ? 'Column name is required!' : null),
        });
  
        if (columnName) {
          try {
            await createColumn(boardId.value, columnName, columns.value.length + 1);
            fetchColumns();
          } catch (error) {
            console.error("❌ Failed to add column:", error);
            if (error.response && error.response.status === 403) {
              Swal.fire("Permission Denied", "You are not the board owner.", "error");
            } else {
              Swal.fire("Error", "Failed to add column", "error");
            }
          }
        }
      };
  
      // ✅ แก้ไข Column
      const handleUpdateColumn = async (col) => {
        try {
          await updateColumnName(boardId.value, col.column_id, col.column_name);
          col.editing = false;
          Swal.fire('Updated!', 'Column name has been updated.', 'success');
        } catch (error) {
          console.error('Failed to update column:', error);
          Swal.fire('Error', 'Failed to update column', 'error');
        }
      };
  
      // ✅ ลบ Column
      const confirmDelete = async (columnId) => {
        Swal.fire({
          title: 'Are you sure?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
          if (result.isConfirmed) {
            await deleteColumn(boardId.value, columnId);
            fetchColumns();
            Swal.fire('Deleted!', 'Column has been deleted.', 'success');
          }
        });
      };
  
      // ✅ เพิ่ม Task
      const promptNewTask = async (columnId) => {
        const { value: taskTitle } = await Swal.fire({
          title: "Enter task name",
          input: "text",
          showCancelButton: true,
          confirmButtonText: "Add Task",
          inputValidator: (value) => (!value ? "Task name is required!" : null),
        });
  
        if (taskTitle) {
          try {
            await createTask(boardId.value, columnId, taskTitle);
            fetchColumns();
          } catch (error) {
            console.error("❌ Error creating task:", error);
          }
        }
      };
  
      // ✅ แก้ไข Task
      const editTask = async (task) => {
        const { value: newTitle } = await Swal.fire({
          title: "Edit task title",
          input: "text",
          inputValue: task.title,
          showCancelButton: true,
          confirmButtonText: "Save",
        });
  
        if (newTitle) {
          await updateTask(task.task_id, newTitle);
          fetchColumns();
        }
      };
  
      // ✅ ลบ Task
      const deleteTask = async (taskId) => {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "Cancel",
        });
  
        if (result.isConfirmed) {
          try {
            await deleteTaskFromService(taskId);
            fetchColumns();
            Swal.fire("Deleted!", "Your task has been deleted.", "success");
          } catch (error) {
            console.error("❌ Failed to delete task:", error);
            Swal.fire("Error", "Failed to delete task", "error");
          }
        }
      };
  
     // ✅ เชิญผู้ใช้เป็น Assignee
     const inviteAssigneeToTask = async (task) => {
  const { value: email } = await Swal.fire({
    title: "Invite Assignee",
    input: "email",
    inputPlaceholder: "Enter user email",
    showCancelButton: true,
    confirmButtonText: "Invite",
    cancelButtonText: "Cancel",
    inputValidator: (value) => {
      if (!value) return 'Please enter an email!';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address!';
      return null;
    }
  });

  if (email) {
    try {
      console.log("📩 Sending invite request to API...");
      const response = await axios.post(
        `http://localhost:5000/api/task_assignees/${boardId.value}/tasks/${task.task_id}/invite`,
        { email },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      console.log("✅ Invite API Response:", response.data);

      // ✅ ตรวจสอบว่า API ตอบกลับมาว่าสำเร็จหรือไม่
      if (response.data.success) {
        console.log("📩 Sending notification to database...");
        const notificationResponse = await createNotification(
          response.data.assignee_id,
          task.task_id,
          boardId.value,
          `You have been assigned to the task: "${task.title}"`
        );

        console.log("✅ Notification API Response:", notificationResponse);
        Swal.fire("Success", "Assignee invited and notification sent!", "success");
      } else {
        console.warn("⚠️ Invite API did not return success:", response.data);
        Swal.fire("Warning", "Failed to send invite. Please try again.", "warning");
      }
    } catch (error) {
      console.error("❌ Error in inviteAssigneeToTask:", error);

      // ✅ เช็คว่ามี response จาก backend หรือไม่
      if (error.response) {
        console.error("❌ Server Response:", error.response.data);
        Swal.fire("Error", error.response.data.message || "Failed to invite user", "error");
      } else {
        Swal.fire("Error", "Failed to connect to server", "error");
      }
    }
  }
};

      // ✅ เริ่มลาก Task
      const startDrag = (taskId) => {
        draggedTaskId.value = taskId;
      };
  
      // ✅ วาง Task ลง Column ใหม่
      const handleDrop = async (newColumnId) => {
        if (draggedTaskId.value) {
          await moveTask(draggedTaskId.value, newColumnId);
          fetchColumns();
        }
      };
  
      onMounted(() => {
        fetchBoardName();
        fetchColumns();
      });
  
      return {
        boardId,
        boardName,
        columns,
        promptNewColumn,
        handleUpdateColumn,
        confirmDelete,
        promptNewTask,
        editTask,
        deleteTask,
        startDrag,
        handleDrop,
        inviteAssigneeToTask, // **ต้องแน่ใจว่าเรากลับส่งฟังก์ชันนี้ไปด้วย**
      };
    },
  };
  </script>

<style>
/* ✅ ปรับให้ Column อยู่ตรงกลางของหน้าจอ */
.d-flex.justify-content-center {
  display: flex;
  justify-content: center;
  overflow-x: auto;
}

/* ✅ ปรับขนาดของ Column */
.column {
  width: 320px; /* ✅ เพิ่มความกว้างขึ้นเล็กน้อย */
  min-height: 500px; /* ✅ เพิ่มความสูง */
  background: #e9f5ec; /* ✅ สีเขียวอ่อน */
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

/* ✅ ให้ Column ไม่ติดกัน และสามารถ Scroll ได้ */
.d-flex.flex-nowrap {
  display: flex;
  flex-wrap: nowrap;
  gap: 24px;
  padding-bottom: 15px;
}

/* ✅ ปรับขนาด Task ให้ยาวขึ้น */
.task-card {
  background: #ffffff;
  padding: 20px;
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: grab;
  font-size: 18px;
  min-height: 200px; /* ✅ ปรับความสูงของ Task Card เป็น 200px */
  display: flex;
  flex-direction: column; /* ✅ จัด Layout ให้เป็นแนวตั้ง */
  justify-content: space-between; /* ✅ ปุ่ม Invite อยู่ข้างล่าง */
  position: relative;
}

/* ✅ ปุ่มด้านบนขวา */
.task-card .task-buttons {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
}

/* ✅ ปุ่ม Invite Assignee อยู่ข้างล่าง */
.task-card .invite-button {
  align-self: center;
  margin-top: auto;
}

/* ✅ ใช้ Flexbox ให้ปุ่มไปทางขวา */
.task-card span {
  flex-grow: 1;
  text-align: center;
}

/* ✅ ปรับแต่งปุ่มให้ดู Smooth */
button {
  transition: all 0.3s ease;
}

button:hover {
  transform: scale(1.05);
}

/* ✅ ลดขนาดปุ่มทั้งหมด */
button.btn-sm {
  padding: 4px 6px;
  font-size: 12px;
}
</style>
