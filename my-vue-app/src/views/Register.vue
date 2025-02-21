<script setup lang="ts">
import { ref } from "vue";
import { register } from "../services/auth";
import { useRouter } from "vue-router";

const username = ref("");
const email = ref("");
const password = ref("");
const message = ref("");
const router = useRouter();

const handleRegister = async () => {
  try {
    await register(username.value, email.value, password.value);
    message.value = "Register successful!";
    router.push("/login");
  } catch (error) {
    message.value = "Error registering user";
  }
};
</script>

<template>
  <div>
    <h2>Register</h2>
    <input v-model="username" placeholder="Username" />
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="handleRegister">Register</button>
    <p>{{ message }}</p>
  </div>
</template>
