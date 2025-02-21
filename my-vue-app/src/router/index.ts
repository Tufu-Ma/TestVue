import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";


const routes: Array<RouteRecordRaw> = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ตรวจสอบว่าผู้ใช้ล็อกอินหรือยัง
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token");
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;
