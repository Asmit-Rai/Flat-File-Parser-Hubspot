<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import FileConfiguration from "@/components/FileConfiguration.vue";
import "../assets/css/Home.css";

const router = useRouter();
const userEmail = ref("");-
onMounted(() => {
  const userDataString = sessionStorage.getItem("user");
  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString);
      if (userData && userData.email) {
        userEmail.value = userData.email;
      }
    } catch (error) {
      console.error("Failed to parse user data from sessionStorage:", error);
    }
  }
});

const handleLogout = () => {
  sessionStorage.clear(); 
  router.push("/sign-in"); 
};

</script>

<template>
  <div class="home-container">
    <aside class="home-sidebar">
      <div class="sidebar-header">
        <h3 class="sidebar-title">Menu</h3>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/" class="sidebar-link">
          <img src="../assets/file.svg" alt="file" class="icon" />
          <span>Parse Flate Files</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-link logout-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="user-icon"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <p class="user-email" :title="userEmail">{{ userEmail }}</p>
        </div>
        <button @click="handleLogout" class="sidebar-link logout-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <main class="file-config-content">
      <FileConfiguration />
    </main>
  </div>
</template>


