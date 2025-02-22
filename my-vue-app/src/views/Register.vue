<template>
  <Navbar />
  <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card shadow-lg p-5" style="max-width: 500px; width: 100%; border-radius: 20px; background-color: #ffffff;">
      <h2 class="text-center text-success fw-bold mb-3">Register</h2>
      <div class="mb-3">
        <label class="form-label fw-semibold">Username</label>
        <input v-model="username" type="text" class="form-control" placeholder="Enter username" />
      </div>
      <div class="mb-3">
        <label class="form-label fw-semibold">Email</label>
        <input v-model="email" type="email" class="form-control" placeholder="Enter email" />
      </div>
      <div class="mb-3 position-relative">
        <label class="form-label fw-semibold">Password</label>
        <div class="input-group">
          <input :type="showPassword ? 'text' : 'password'" v-model="password" class="form-control" placeholder="Enter password" />
          <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" class="password-icon"></i>
          </button>
        </div>
      </div>
      <div class="mb-3 position-relative">
        <label class="form-label fw-semibold">Confirm Password</label>
        <div class="input-group">
          <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword" class="form-control" placeholder="Confirm password" />
          <button class="btn btn-outline-secondary" type="button" @click="showConfirmPassword = !showConfirmPassword">
            <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" class="password-icon"></i>
          </button>
        </div>
      </div>
      <button @click="handleRegister" class="btn btn-success w-100 py-2 fw-semibold">Register</button>
      <p class="text-center text-danger mt-3 fw-bold">{{ message }}</p>
      <p class="text-center mt-3">Already have an account? <a href="#" @click.prevent="router.push('/login')" class="text-success fw-semibold">Login here</a></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
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

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    message.value = "Passwords do not match";
    return;
  }
  try {
    await register(username.value, email.value, password.value);
    message.value = "Register successful!";
    router.push("/login");
  } catch (error) {
    message.value = "Error registering user";
  }
};
</script>

<style>
body {
  background-color: #ffffff;
}
.password-icon {
  font-size: 1.2rem;
  color: #6c757d;
}
.form-container {
  max-width: 500px;
  width: 100%;
  border-radius: 20px;
  background-color: #ffffff;
}
</style>