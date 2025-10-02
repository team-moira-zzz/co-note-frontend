<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { isLoggedIn, getAccessToken, logout } from '@/stores/authStore';

const router = useRouter();
const groupCount = ref(null);
const isLoading = ref(true);

// 로그인 페이지로 리다이렉트
const goToLogin = () => {
  router.push('/login');
};

// '가계부 생성' 페이지로 리다이렉트
const startCreating = () => {
  router.push('/group/create');
};

// 특정 유저의 그룹 가입 여부 조회
const fetchGroupCount = async () => {
  if (!isLoggedIn.value) {
    isLoading.value = false;
    return;
  }

  const token = getAccessToken();
  if (!token) {
    isLoading.value = false;
    return;
  }

  try {
    const response = await axios.get(`http://localhost:8080/api/book/group/count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    groupCount.value = response.data;

    // 가입된 그룹이 있다면 /book으로 리다이렉트
    if (groupCount.value > 0) {
      router.replace('/book');
    }

  } catch (error) {
    console.error("그룹 수 조회 API 호출 실패:", error);

    if (error.response && error.response.status === 401) {
      logout();
      router.push({ path: '/login', query: { expired: 'true' } });
      return;
    }

    groupCount.value = 0;
  } finally {
    if (groupCount.value !== null) {
      isLoading.value = false;
    }
  }
};

onMounted(() => {
  fetchGroupCount();
});
</script>

<template>
  <div class="home-container">
    <div v-if="isLoading" class="loading-content">
      <h1>잠시만 기다려 주세요...</h1>
    </div>

    <div v-else-if="isLoggedIn && groupCount === 0" class="logged-in-content">
      <h1>함께 만들어가는 가계부, Co-Note!</h1>
      <p class="subtitle">시작할 준비가 되었어요. 가계부 그룹을 생성해주세요.</p>
      <div class="start-buttons">
        <button @click="startCreating" class="start-btn primary">가계부 작성 시작하기</button>
      </div>
    </div>

    <div v-else-if="!isLoggedIn" class="logged-out-content">
      <h1>함께 기록해요! Co-Note에서 가계부 작성을 시작하세요.</h1>
      <p class="subtitle">소셜 로그인을 통해 10초 만에 시작할 수 있어요.</p>
      <button @click="goToLogin" class="start-btn primary">로그인하고 시작하기</button>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 60px);
  width: 100%;
  padding-top: 50px;
  background-color: white;
  text-align: center;
}

.logged-in-content,
.logged-out-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

h1 {
  font-size: 2.5em;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.5em;
  color: #555;
  margin-bottom: 40px;
}

.start-buttons {
  display: flex;
  justify-content: center;
}

.start-btn {
  padding: 15px 30px;
  font-size: 1.2em;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.start-btn:active {
  transform: scale(0.98);
}

.start-btn.primary {
  background-color: #3498db;
  color: white;
}

.start-btn.primary:hover {
  background-color: #2980b9;
}
</style>