<script setup>
import { useRouter } from 'vue-router';
import axios from 'axios';
import { isLoggedIn, userNickname, logout, getAccessToken } from '../stores/authStore';

const router = useRouter();

const handleLogout = async () => {
  const token = getAccessToken();

  try {
    // [1] Authorization 헤더에 AccessToken을 담아 요청
    await axios.post('http://localhost:8080/api/logout', null, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // [2] localStorage에서 AccessToken 제거
    logout();

    // [3] 로그인 페이지로 리다이렉트
    router.push('/login');

  } catch (error) {
    console.error("로그아웃 API 호출 실패:", error);

    logout();
    router.push('/login?logout_failed=true');
  }
};
</script>

<template>
  <header class="main-header">
    <div class="logo">
      <router-link to="/">Co-Note</router-link>
    </div>

    <nav class="auth-menu">
      <span v-if="isLoggedIn" class="user-greeting">
        <span class="nickname-text">{{ userNickname }}</span>님 안녕하세요!
        <button @click="handleLogout" class="logout-btn">로그아웃</button>
      </span>

      <span v-else>
        <router-link to="/register" class="auth-link">회원가입</router-link>
        <router-link to="/login" class="auth-link">로그인</router-link>
      </span>
    </nav>
  </header>
</template>

<style scoped>
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  height: 60px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;
}

.logo a {
  font-size: 1.5em;
  font-weight: bold;
  color: #3498db;
  text-decoration: none;
}

.auth-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.auth-link {
  text-decoration: none;
  color: #333;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.auth-link:hover {
  background-color: #e0e0e0;
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95em;
  color: #555;
}

.nickname-text {
  font-weight: bold;
  color: #2c3e50;
}

.logout-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #2980b9;
}
</style>