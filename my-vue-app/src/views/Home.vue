<script setup lang="ts">
import { useRouter } from "vue-router";
import Navbar from "@/components/Navbar.vue";
const router = useRouter();

// ✅ เมื่อกดปุ่ม "Get Started" ให้ไปที่หน้าหลักของบอร์ด
const getStarted = () => {
  router.push("/login");
};
</script>

<template>
    <Navbar />
  <div class="home-container">
    <!-- ✅ เนื้อหาทางซ้าย -->
    <div class="text-section">
      <h1 class="title">
        Welcome to <span class="highlight">My Kanban</span>
      </h1>
      <p class="description">
        Manage your tasks and projects efficiently with our Kanban board.
      </p>
      <button class="btn-get-started" @click="getStarted">
        Get Started
      </button>
    </div>

    <!-- ✅ รูปภาพทางขวา -->
    <div class="image-section">
      <img
        src="/kanban_home.png"
        alt="Kanban Board"
        class="kanban-image"
      />
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 80vh;
  padding: 25px 20px;
  max-width: 1200px;
  margin: auto;
}

.text-section {
  flex: 1;
  padding-right: 20px;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2d3748;
}

.highlight {
  color: #3182ce;
}

.description {
  color: #718096;
  margin-top: 10px;
  font-size: 1.125rem;
}

.btn-get-started {
  background-color: #38a169;
  color: white;
  padding: 15px 30px;
  font-size: 1.125rem;
  border-radius: 30px;
  margin-top: 20px;
  transition: background-color 0.3s;
  cursor: pointer;
}

.btn-get-started:hover {
  background-color: #2f855a;
}

.image-section {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.kanban-image {
  max-width: 600px;
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 0 40px rgba(56, 161, 105, 0.8); /* ✅ ขอบฟุ้งสีเขียว */
}
</style>
