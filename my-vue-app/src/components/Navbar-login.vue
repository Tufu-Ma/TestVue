<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { getNotificationsByUser, deleteNotification } from "@/services/notificationService";

// ตัวแปรสำหรับการจัดการการนำทาง
const router = useRouter();

// ตัวแปรสำหรับการแจ้งเตือน (notifications)
const notifications = ref<any[]>([]);

// ตัวแปรสำหรับการแสดง/ซ่อน dropdown และการแจ้งเตือน
const showNotifications = ref(false); // ตัวแปรสำหรับแสดง/ซ่อน container การแจ้งเตือน
const showDropdown = ref(false); // ตัวแปรสำหรับแสดง/ซ่อน dropdown menu ของ profile

// ฟังก์ชันสำหรับ toggle dropdown
const toggleDropdown = (event: MouseEvent) => {
  event.stopPropagation(); // ป้องกันการกระจายของ event
  showDropdown.value = !showDropdown.value;
  console.log("Dropdown state:", showDropdown.value);
  // เมื่อเปิด dropdown, ปิด notifications
  if (showNotifications.value) {
    showNotifications.value = false;
  }
};

// ฟังก์ชันสำหรับ toggle notifications
const toggleNotifications = (event: MouseEvent) => {
  event.stopPropagation(); // ป้องกันการกระจายของ event
  showNotifications.value = !showNotifications.value;
  console.log("Notifications state:", showNotifications.value);
  // เมื่อเปิด notifications, ปิด dropdown
  if (showDropdown.value) {
    showDropdown.value = false;
  }
};

// ฟังก์ชัน logout
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user_id');
  router.push('/login');
};

// ฟังก์ชันสำหรับการนำทาง
const goTo = (path: string) => {
  router.push(path);
};

// ฟังก์ชันสำหรับลบการแจ้งเตือน
const removeNotification = async (id: number) => {
  try {
    await deleteNotification(id);
    notifications.value = notifications.value.filter(notification => notification.id !== id);
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
};

// ฟังก์ชันคลิกที่ตำแหน่งอื่น ๆ ให้ปิด container
const closeDropdownAndNotifications = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (
    !target.closest(".dropdown-menu") && 
    !target.closest(".notification-container") && 
    !target.closest(".notification-btn") && 
    !target.closest(".profile-icon")
  ) {
    showDropdown.value = false;
    showNotifications.value = false;
  }
};

// ทำการ cleanup เมื่อ component ถูกลบออกจากหน้าจอ
onBeforeUnmount(() => {
  document.removeEventListener("click", closeDropdownAndNotifications);
});

document.addEventListener("click", closeDropdownAndNotifications);

// ตรวจสอบ token เมื่อโหลดหน้า
onMounted(async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
  }

  const userId = localStorage.getItem('user_id');
  if (userId) {
    try {
      notifications.value = await getNotificationsByUser(Number(userId));
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  }
});
</script>

<template>
  <nav class="navbar">
    <div class="container">
      <!-- โลโก้ -->
      <a class="navbar-brand" href="#" @click.prevent="goTo('/')">
        <img src="/kanban.gif" alt="Logo" class="logo" />
      </a>

      <div class="menu">
        <button @click="goTo('/')">Home</button>
        <button @click="goTo('/about')">About Us</button>

        <!-- ไอคอนการแจ้งเตือน -->
        <div class="notifications">
          <button @click="toggleNotifications" class="notification-btn">
            <i class="bi bi-bell"></i>
            <span v-if="notifications.length > 0" class="badge">
              {{ notifications.length }}
            </span>
          </button>
        </div>

        <!-- โปรไฟล์และ dropdown -->
        <div class="dropdown">
          <img 
            src="/profile.png" 
            alt="Profile" 
            class="profile-icon" 
            @click="toggleDropdown" 
          />
          <div v-show="showDropdown" class="dropdown-menu">
            <a href="#" @click="logout">Logout</a>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- การแสดงการแจ้งเตือน -->
  <div v-if="showNotifications" class="notification-container">
    <div v-for="(notification, index) in notifications" :key="index" class="notification-card">
      <p @click="goTo(`/notifications/${notification.id}`)" class="notification-message">
        {{ notification.message }}
      </p>
      <button @click="removeNotification(notification.id)" class="delete-btn">
        <i class="bi bi-x-circle"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* สไตล์สำหรับโลโก้ */
.logo {
  height: 40px;
  width: auto;
  cursor: pointer;
}

/* สไตล์สำหรับเมนู */
.menu {
  display: flex;
  align-items: center;
}

.menu button {
  margin-right: 10px;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #ccc;
  cursor: pointer;
  border-radius: 20px;
}

.menu button:hover {
  background-color: #e2e6ea;
}

/* สไตล์สำหรับไอคอนโปรไฟล์ */
.profile-icon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.profile-icon:hover {
  transform: scale(1.1);
}

/* สไตล์สำหรับการแจ้งเตือน */
.notifications {
  position: relative;
}

.notification-btn {
  background: none;
  border: none;
  position: relative;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 3px 6px;
  font-size: 12px;
}

/* สไตล์สำหรับ container การแจ้งเตือน */
.notification-container {
  position: absolute;
  top: 55px;
  right: 165px;
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 280px;
  max-height: 300px;
  overflow-y: auto;
  border-radius: 10px;
  z-index: 100;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* สไตล์ของการแจ้งเตือน */
.notification-card {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  position: relative;
}

.notification-message {
  margin: 0;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 250px;
}

.notification-message:hover {
  text-decoration: underline;
}

/* ปุ่มลบการแจ้งเตือน */
.delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  color: red;
  cursor: pointer;
  padding: 5px;
}

.delete-btn:hover {
  background-color: #f0f0f0;
  border-radius: 50%;
}

.delete-btn i {
  font-size: 16px;
}

/* สไตล์ dropdown menu */
.dropdown-menu {
  position: absolute;
  top: 40px;
  right: 0;
  background-color: white;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  min-width: 160px;
  border-radius: 5px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.dropdown-menu a {
  display: block;
  padding: 10px;
  text-decoration: none;
  color: black;
}

.dropdown-menu a:hover {
  background-color: #f1f1f1;
}
</style>
