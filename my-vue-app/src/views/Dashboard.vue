<template>
  <Navbarlogin />
    <div class="container mt-4 dashboard-wrapper">
      <h2 class="text-center mb-4 text-success">📌 Dashboard</h2>

      <div v-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else>
        <div class="d-flex justify-content-end mb-3">
          <button class="btn btn-success btn-lg shadow-sm rounded-pill px-4" @click="openCreateBoardModal">
            + เพิ่ม Board
          </button>
        </div>

        <div class="row">
          <!-- Boards You Own -->
          <div class="col-md-6">
            <div class="board-section">
              <h4 class="text-primary">🛠 Boards You Own</h4>
              <div v-if="ownedBoards.length === 0" class="alert alert-light text-center">
                ไม่มีบอร์ดที่คุณเป็นเจ้าของ
              </div>
              <div v-else class="board-list">
                <div
                  v-for="board in ownedBoards"
                  :key="board.board_id"
                  class="card board-card"
                  @click="goToBoard(board.board_id)"
                >
                  <div class="card-body">
                    <h5 class="card-title text-success">{{ board.board_name }}</h5>
                    <div class="d-flex justify-content-between">
                      <div>
                        <button class="btn btn-warning btn-sm me-2" @click.stop="editBoard(board)">Edit</button>
                        <button class="btn btn-danger btn-sm me-2" @click.stop="deleteBoard(board.board_id)">Delete</button>
                      </div>
                      <button class="btn btn-info btn-sm" @click.stop="inviteUserToBoard(board.board_id)">Invite</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Boards You Joined -->
          <div class="col-md-6">
            <div class="board-section">
              <h4 class="text-success">🤝 Boards You Joined</h4>
              <div v-if="memberBoards.length === 0" class="alert alert-light text-center">
                ไม่มีบอร์ดที่คุณเข้าร่วม
              </div>
              <div v-else class="board-list">
                <div
                  v-for="board in memberBoards"
                  :key="board.board_id"
                  class="card board-card"
                  @click="goToBoard(board.board_id)"
                >
                  <div class="card-body">
                    <h5 class="card-title text-primary">{{ board.board_name }}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import Navbarlogin from "@/components/Navbar-login.vue";
import boardService from "@/services/boardService";
import boardMemberService from "@/services/boardMemberService";

export default {
  components: { Navbarlogin },
  setup() {
    const router = useRouter();
    const ownedBoards = ref([]);
    const memberBoards = ref([]);
    const loading = ref(true);

    const fetchBoards = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          Swal.fire("Error", "User not logged in. Please log in first.", "error");
          return;
        }
        const response = await fetch(`http://localhost:5000/api/users/${userId}/boards`);
        if (!response.ok) throw new Error("Failed to fetch boards");
        const data = await response.json();
        ownedBoards.value = data.ownedBoards;
        memberBoards.value = data.memberBoards;
      } catch (error) {
        console.error("Error fetching boards:", error);
      } finally {
        loading.value = false;
      }
    };

    const goToBoard = (boardId) => {
      router.push(`/board/${boardId}`);
    };

    const openCreateBoardModal = async () => {
      const { value: boardName } = await Swal.fire({
        title: "สร้าง Board ใหม่",
        input: "text",
        inputPlaceholder: "ชื่อ Board",
        showCancelButton: true,
        confirmButtonText: "สร้าง",
        cancelButtonText: "ยกเลิก",
      });

      if (boardName) {
        createBoard(boardName);
      }
    };

    const createBoard = async (boardName) => {
      const userId = localStorage.getItem("user_id");
      if (!boardName.trim() || !userId) {
        Swal.fire("Error", "กรุณากรอกชื่อ Board และตรวจสอบว่าคุณล็อกอินอยู่", "error");
        return;
      }
      try {
        await boardService.createBoard(boardName, userId);
        fetchBoards();
        Swal.fire("สำเร็จ!", "Board ถูกสร้างเรียบร้อยแล้ว", "success");
      } catch (error) {
        console.error("Error creating board:", error);
        Swal.fire("ล้มเหลว", "เกิดข้อผิดพลาดในการสร้าง Board", "error");
      }
    };

    const editBoard = async (board) => {
      const { value: newBoardName } = await Swal.fire({
        title: "แก้ไขชื่อ Board",
        input: "text",
        inputValue: board.board_name,
        showCancelButton: true,
        confirmButtonText: "บันทึก",
      });

      if (newBoardName) {
        try {
          await boardService.updateBoard(board.board_id, newBoardName);
          fetchBoards();
          Swal.fire("สำเร็จ!", "ชื่อ Board ถูกอัปเดตแล้ว", "success");
        } catch (error) {
          console.error("Error updating board:", error);
          Swal.fire("ล้มเหลว", "เกิดข้อผิดพลาดในการแก้ไข Board", "error");
        }
      }
    };

    const deleteBoard = async (board_id) => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        Swal.fire("Error", "You need to log in first.", "error");
        return;
      }

      const result = await Swal.fire({
        title: "คุณแน่ใจหรือไม่?",
        text: "การลบนี้ไม่สามารถย้อนกลับได้!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "ใช่, ลบเลย!",
      });

      if (result.isConfirmed) {
        try {
          await boardService.deleteBoard(board_id, userId);
          fetchBoards();
          Swal.fire("ลบแล้ว!", "Board ถูกลบเรียบร้อย", "success");
        } catch (error) {
          console.error("Error deleting board:", error);
          Swal.fire("ล้มเหลว", "เกิดข้อผิดพลาดในการลบ Board", "error");
        }
      }
    };

    const inviteUserToBoard = async (boardId) => {
  const { value: email } = await Swal.fire({
    title: "เชิญเข้าร่วม Board",
    input: "email",
    inputPlaceholder: "กรอกอีเมลของผู้ใช้",
    showCancelButton: true,
    confirmButtonText: "ส่งคำเชิญ",
    cancelButtonText: "ยกเลิก",
  });

  if (email) {
    try {
      const ownerId = localStorage.getItem("user_id"); // ดึง user_id ของเจ้าของ
      console.log(`📌 Checking user_id: ${ownerId} for board: ${boardId}`);

      const response = await boardMemberService.inviteUserToBoard(boardId, email);

      Swal.fire("สำเร็จ!", "ส่งคำเชิญเรียบร้อยแล้ว", "success");
    } catch (error) {
      console.error("Error inviting user:", error.message);
      Swal.fire("ล้มเหลว", error.message, "error");
    }
  }
};

    onMounted(fetchBoards);

    return {
      ownedBoards,
      memberBoards,
      loading,
      goToBoard,
      openCreateBoardModal,
      createBoard,
      editBoard,
      deleteBoard,
      fetchBoards,
      inviteUserToBoard,
    };
  },
};
</script>

<style scoped>
/* พื้นหลังสีขาว และให้มีกรอบชัดเจน */
.dashboard-container {
  background-color: #ffffff;
  min-height: 100vh;
  padding-bottom: 30px;
  display: flex;
  justify-content: center;
}

/* กรอบรอบ Dashboard */
.dashboard-wrapper {
  background: #ffffff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 1200px;
}

/* กรอบให้ส่วน Boards */
.board-section {
  padding: 20px;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  background: #f8f9fa;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

/* ปรับการ์ดให้มีระยะห่างมากขึ้น */
.board-card {
  background: #ffffff;
  border: 1px solid #c3e6cb;
  border-radius: 12px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  margin-bottom: 20px;
  cursor: pointer;
}

.board-card:hover {
  transform: scale(1.05);
  box-shadow: 0px 5px 15px rgba(0, 128, 0, 0.2);
}

/* ปุ่มที่สวยงามขึ้น */
.btn-success {
  background-color: #28a745;
  border: none;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-warning {
  background-color: #ffc107;
  border: none;
}

.btn-danger {
  background-color: #dc3545;
  border: none;
}

.btn-info {
  background-color: #17a2b8;
  border: none;
}
</style>
