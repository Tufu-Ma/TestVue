<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

// ✅ เปลี่ยนหน้าเมื่อกดปุ่ม
const goTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <nav class="navbar navbar-expand-lg ">
    <div class="container">
      <!-- ✅ กดที่ Logo เพื่อไป Home -->
      <a class="navbar-brand" href="#" @click.prevent="goTo('/')">
        <img src="/kanban.gif" alt="Logo" class="logo" />
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto gap-2"> <!-- ✅ เพิ่ม gap-3 เพื่อเว้นระยะห่าง -->
          <!-- ✅ ปุ่ม About Us -->
          <li class="nav-item">
            <button class="btn btn-outline-secondary btn-custom tw-mx-2" @click="goTo('/about')">About Us</button>
          </li>
          <!-- ✅ ปุ่ม Login -->
          <li class="nav-item">
            <button class="btn btn-outline-primary btn-custom tw-mx-2" @click="goTo('/login')">Login</button>
          </li>
          <!-- ✅ ปุ่ม Register (เปลี่ยนเป็นสีเขียว) -->
          <li class="nav-item">
            <button class="btn btn-success btn-custom tw-mx-2" @click="goTo('/register')">Register</button>
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
  margin-right: 10px;
  cursor: pointer;
}

/* ✅ ปรับปุ่มให้ดูสวยขึ้น */
.btn-custom {
  font-size: 14px;
  padding: 6px 16px;
  border-radius: 20px;
  transition: all 0.3s ease-in-out;
}

/* ✅ เพิ่มเอฟเฟกต์ Hover */
.btn-custom:hover {
  transform: scale(1.05);
}
</style>
