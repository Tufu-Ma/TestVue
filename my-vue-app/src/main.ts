import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ ใช้ Bootstrap CSS
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // ✅ ใช้ Bootstrap JS
import "./assets/tailwind.css"; // ✅ ใช้ Tailwind CSS

const app = createApp(App);
app.use(router);
app.mount("#app");
