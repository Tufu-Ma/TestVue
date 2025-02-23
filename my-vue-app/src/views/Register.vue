<template>
  <Navbar />
  <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card shadow-lg p-5" style="max-width: 500px; width: 100%; border-radius: 20px; background-color: #ffffff;">
      <h2 class="text-center text-success fw-bold mb-3">Register</h2>
      
      <form @submit.prevent="handleRegister">
        <!-- Username Input -->
        <div class="mb-3">
          <label class="form-label fw-semibold">Username</label>
          <input v-model="username" type="text" class="form-control" placeholder="Enter username" required />
        </div>

        <!-- Email Input -->
        <div class="mb-3">
          <label class="form-label fw-semibold">Email</label>
          <input v-model="email" type="email" class="form-control" placeholder="Enter email" required />
        </div>

        <!-- Password Input -->
        <div class="mb-3 position-relative">
          <label class="form-label fw-semibold">Password</label>
          <div class="input-group">
            <input :type="showPassword ? 'text' : 'password'" v-model="password" class="form-control" placeholder="Enter password" required />
            <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" class="password-icon"></i>
            </button>
          </div>
        </div>

        <!-- Confirm Password Input -->
        <div class="mb-3 position-relative">
          <label class="form-label fw-semibold">Confirm Password</label>
          <div class="input-group">
            <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword" class="form-control" placeholder="Confirm password" required />
            <button class="btn btn-outline-secondary" type="button" @click="showConfirmPassword = !showConfirmPassword">
              <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" class="password-icon"></i>
            </button>
          </div>
        </div>

        <!-- Register Button -->
        <button type="submit" class="btn btn-success w-100 py-2 fw-semibold">Register</button>
      </form>

      <!-- Error Message -->
      <p v-if="message" class="text-center text-danger mt-3 fw-bold">{{ message }}</p>

      <!-- Login Link -->
      <p class="text-center mt-3">
        Already have an account? 
        <a href="#" @click.prevent="router.push('/login')" class="text-success fw-semibold">Login here</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { register } from "../services/auth";
import { useRouter } from "vue-router";
import Navbar from "@/components/Navbar.vue";

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const message = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const router = useRouter();

// ตรวจสอบว่า user ได้ล็อกอินแล้วหรือยัง
onMounted(() => {
  const token = localStorage.getItem("token");
  if (token) {
    // ถ้ามี token ให้ไปที่หน้า dashboard
    router.push("/dashboard");
  }
});

const handleRegister = async () => {
  // ตรวจสอบว่า password และ confirm password ตรงกันหรือไม่
  if (password.value !== confirmPassword.value) {
    message.value = "Passwords do not match";
    return;
  }

  // ตรวจสอบว่า username, email, password ไม่ว่าง
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    message.value = "All fields are required";
    return;
  }

  try {
    await register(username.value, email.value, password.value);
    message.value = "Register successful!";
    router.push("/login"); // ไปที่หน้า login หลังจากลงทะเบียนสำเร็จ
  } catch (error) {
    message.value = "Error registering user";
  }
};
</script>

<style scoped>
body {
  background-color: #ffffff;
}

.password-icon {
  font-size: 1.2rem;
  color: #6c757d;
}

/* ปรับสไตล์ปุ่ม Register */
.btn-success {
  background-color: #38a169;
  color: white;
  transition: background-color 0.3s;
}

.btn-success:hover {
  background-color: #2f855a;
}

/* เพิ่มช่องว่างให้ข้อความ error */
.text-center {
  margin-top: 10px;
}

.form-container {
  max-width: 500px;
  width: 100%;
  border-radius: 20px;
  background-color: #ffffff;
}
</style>
