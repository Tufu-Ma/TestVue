// router/index.ts (หรือ router.js)
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Dashboard from "@/views/Dashboard.vue";
import Boards from "@/views/Boards.vue";
import About from '@/views/About.vue';

const routes: Array<RouteRecordRaw> = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register, meta: { requiresAuth: false } },
  { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/boards", component: Boards }, // เส้นทางบอร์ดทั่วไป
  { path: "/board/:boardId", component: Boards, name: "Board", props: true }, // ✅ ใช้ Boards.vue และส่ง boardId เป็น props
  { path: '/about', component: About },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ตรวจสอบการล็อกอิน
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token");

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (to.path === "/login" && isAuthenticated) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;