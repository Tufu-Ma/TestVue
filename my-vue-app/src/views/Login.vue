<script setup lang="ts">
import { ref } from "vue";
import { login } from "@/services/auth"; // ใช้ฟังก์ชัน login จาก auth service
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const message = ref("");
const isLoading = ref(false);
const router = useRouter();

const handleLogin = async () => {
  message.value = "";
  isLoading.value = true;
  
  try {
    const response = await login(email.value, password.value);
    localStorage.setItem("token", response.token);
    message.value = "เข้าสู่ระบบสำเร็จ!";
    
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  } catch (error) {
    message.value = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-green-600">
    <div class="container max-w-md mx-auto p-6">
      <div class="bg-white shadow-xl rounded-2xl p-8 w-full">
        <h2 class="text-2xl font-bold text-center text-green-600 mb-6">เข้าสู่ระบบ</h2>

        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block text-gray-700 font-medium mb-2" for="email">อีเมล</label>
            <input
              v-model="email"
              type="email"
              id="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="กรอกอีเมลของคุณ"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 font-medium mb-2" for="password">รหัสผ่าน</label>
            <input
              v-model="password"
              type="password"
              id="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="กรอกรหัสผ่าน"
              required
            />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition duration-300"
          >
            <span v-if="isLoading">กำลังเข้าสู่ระบบ...</span>
            <span v-else>เข้าสู่ระบบ</span>
          </button>
        </form>

        <p v-if="message" class="text-center mt-4 text-sm font-semibold" :class="message.includes('สำเร็จ') ? 'text-green-600' : 'text-red-500'">
          {{ message }}
        </p>

        <p class="text-gray-600 text-center mt-4">
          ยังไม่มีบัญชี? <a href="#" class="text-green-600 font-semibold hover:underline">สมัครสมาชิก</a>
        </p>
      </div>
    </div>
  </div>
</template>
