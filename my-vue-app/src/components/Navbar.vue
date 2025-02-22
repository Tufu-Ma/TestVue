<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

// ✅ เปลี่ยนหน้าเมื่อกดปุ่ม
const goTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-white shadow-sm">
    <div class="container">
      <!-- ✅ โลโก้ -->
      <a class="navbar-brand" href="#" @click.prevent="goTo('/')">
        <img src="/kanban.gif" alt="Logo" class="logo" />
      </a>

      <!-- ✅ ปุ่ม Toggle (มือถือ) -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- ✅ เมนูหลัก -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto gap-2">
          <!-- ✅ ปุ่ม About Us -->
          <li class="nav-item">
            <button class="btn btn-outline-secondary btn-custom mx-2" @click="goTo('/about')">About Us</button>
          </li>
          <!-- ✅ ปุ่ม Login -->
          <li class="nav-item">
            <button class="btn btn-outline-primary btn-custom mx-2" @click="goTo('/login')">Login</button>
          </li>
          <!-- ✅ ปุ่ม Register (เปลี่ยนเป็นสีเขียว) -->
          <li class="nav-item">
            <button class="btn btn-success btn-custom mx-2" @click="goTo('/register')">Register</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* ✅ ปรับขนาดโลโก้ */
.logo {
  height: 48px;
  width: auto;
  cursor: pointer;
}

/* ✅ ปรับปุ่มให้ดูสวยขึ้น */
.btn-custom {
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease-in-out;
}

/* ✅ เอฟเฟกต์ Hover */
.btn-custom:hover {
  transform: scale(1.05);
}
</style>
