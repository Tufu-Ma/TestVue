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
                  <button @click="deleteTask(task.task_id)" class="btn btn-danger btn-sm">❌</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
</template>

<style>
/* ✅ ปรับให้ Column อยู่ตรงกลางของหน้าจอ */
.d-flex.justify-content-center {
  display: flex;
  justify-content: center;
  overflow-x: auto;
}

/* ✅ ปรับขนาดของ Column */
.column {
  width: 300px;
  min-height: 450px;
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

/* ✅ ปรับขนาด Task ให้ใหญ่ขึ้น */
.task-card {
  background: #ffffff;
  padding: 18px;
  margin-bottom: 12px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: grab;
  font-size: 16px;
  min-height: 80px;
  display: flex;
  align-items: center;
}

/* ✅ ใช้ Flexbox ให้ปุ่มไปทางขวา */
.task-card span {
  flex-grow: 1;
}

/* ✅ ปรับแต่งปุ่มให้ดู Smooth */
button {
  transition: all 0.3s ease;
}

button:hover {
  transform: scale(1.05);
}

</style>

<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getBoardName, getColumns, createColumn, updateColumnName, deleteColumn } from "../services/boardColumnsService";
import { getTasks, createTask, updateTask, moveTask } from "../services/taskService";
import { deleteTask as deleteTaskFromService } from "../services/taskService"; 

import Swal from "sweetalert2";
import Navbarlogin from "@/components/Navbar-login.vue";

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
    console.log(`✅ Creating task with:`, { boardId: boardId.value, columnId, taskTitle }); // ✅ Debugging

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
        inputValue: task.title,  // ✅ ใช้ task.title แทน task.task_name
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
      await deleteTaskFromService(taskId); // ✅ ลบ Task จริงๆ
      fetchColumns(); // ✅ โหลดข้อมูลใหม่
      Swal.fire("Deleted!", "Your task has been deleted.", "success");
    } catch (error) {
      console.error("❌ Failed to delete task:", error);
      Swal.fire("Error", "Failed to delete task", "error");
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
    };
  },
};
</script>

