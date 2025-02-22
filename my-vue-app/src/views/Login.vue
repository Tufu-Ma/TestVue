<script setup lang="ts">
import { ref } from "vue";
import { login } from "@/services/auth";
import { useRouter } from "vue-router";
import Navbar from "@/components/Navbar.vue";

const email = ref("");
const password = ref("");
const message = ref("");
const isLoading = ref(false);
const showPassword = ref(false); // ✅ เพิ่มตัวแปรแสดง/ซ่อนรหัสผ่าน
const router = useRouter();

const handleLogin = async () => {
  message.value = "";
  isLoading.value = true;

  try {
    const response = await login(email.value, password.value);
    localStorage.setItem("token", response.token);
    message.value = "Login Complete!";

    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  } catch (error) {
    message.value = "Wrong email or password!";
  } finally {
    isLoading.value = false;
  }
};

// ✅ ฟังก์ชันโยงไปหน้า Register
const goToRegister = () => {
  router.push("/register");
};
</script>

<template>
  <Navbar />
  <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card shadow-lg p-5 form-container">
      <h2 class="text-center text-success fw-bold mb-3">Login</h2>

      <!-- ฟอร์มล็อกอิน -->
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label fw-semibold">Email</label>
          <input v-model="email" type="email" id="email" class="form-control" placeholder="Enter email" required />
        </div>

        <div class="mb-3 position-relative">
          <label for="password" class="form-label fw-semibold">Password</label>
          <div class="input-group">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              class="form-control"
              placeholder="Enter password"
              required
            />
            <button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <button type="submit" :disabled="isLoading" class="btn btn-success w-100 py-2 fw-semibold">
          <span v-if="isLoading">Loading...</span>
          <span v-else>Login</span>
        </button>
      </form>

      <!-- แสดงข้อความแจ้งเตือน -->
      <div v-if="message" class="alert mt-3" :class="message.includes('Complete') ? 'alert-success' : 'alert-danger'">
        {{ message }}
      </div>

      <!-- ลิงก์สมัครสมาชิก -->
      <p class="text-center mt-3">
        Don't have an account?
        <a href="#" @click.prevent="goToRegister" class="text-success fw-semibold">Sign up here</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ✅ ปรับขนาดฟอร์มให้เหมือนหน้า Register */
.form-container {
  max-width: 500px;
  width: 100%;
  border-radius: 20px;
  background-color: #ffffff;
}

/* ✅ ทำให้พื้นหลังเป็นสีเขียวอ่อน */
body {
  background-color: #e1fdde;
}
</style>
