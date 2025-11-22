<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import "../assets/css/SignIn.css";

const router = useRouter();
const email = ref("");
const password = ref("");
const loading = ref(false);

async function userData(e) {
  e.preventDefault();
  loading.value = true;

  try {
    const response = await fetch(
      "http://localhost:3000/sign-in",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: email.value,
          userPassword: password.value,
        }),
      }
    );

    const responseData = await response.json();

    if (responseData.auth === true) {
      // sessionStorage.setItem("user", JSON.stringify(responseData.auth));
      sessionStorage.setItem("user", JSON.stringify(responseData.user));
      router.replace("/");
    } else {
      alert("Incorrect Email and Password");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("An error occurred during login. Please try again.");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="signin-container">
    <div class="signin-card">
      <div class="signin-heading">
        <p class="signin-title">Login</p>
        <p class="signin-sub">Welcome Back</p>
      </div>

      <form class="signin-form" @submit="userData">
        <label for="email" class="input-label">Email</label>
        <input
          v-model="email"
          type="email"
          placeholder="admin@gmail.com"
          name="email"
          required
        />
        <label for="password" class="input-label">Password</label>
        <input
          v-model="password"
          type="password"
          placeholder="******"
          name="password"
          required
        />
        <button type="submit" :disabled="loading">
          {{ loading ? "Signing In..." : "Sign In" }}
        </button>
      </form>
    </div>
  </div>
</template>
