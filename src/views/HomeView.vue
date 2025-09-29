<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { isLoggedIn, getAccessToken, logout } from '@/stores/authStore';

const router = useRouter();
const groupCount = ref(null);
const isLoading = ref(true);

// 비로그인 사용자: '로그인하고 시작하기' 버튼 클릭 시
const goToLogin = () => {
  router.push('/login');
};

// 로그인 사용자: '가계부 작성 시작하기' 버튼 클릭 시 (가입된 그룹이 없을 때)
const startCreating = () => {
  console.log("가계부 작성 시작하기 (그룹 생성/참여 페이지) 클릭됨.");
  // TODO: router.push('/group/onboarding'); 
};

const fetchGroupCount = async () => {
  // [1] 로그인이 되어 있지 않은 경우 return
  if (!isLoggedIn.value) {
    isLoading.value = false;
    return;
  }

  // [2] AccessToken 추출
  const token = getAccessToken();

  // [3] AccessToken이 유효하지 않은 경우 return
  if (!token) {
    isLoading.value = false;
    return;
  }

  // [4] 백엔드 API 호출 (해당 유저의 가입 그룹 수를 계산)
  try {
    const response = await axios.get(`http://localhost:8080/api/book/group/count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    groupCount.value = response.data;
  } catch (error) {
    console.error("그룹 수 조회 API 호출 실패:", error);

    // [5] 토큰 만료 (401 Unauthorized) 처리 로직
    if (error.response && error.response.status === 401) {
      logout();

      router.push({
        path: '/login',
        query: { expired: 'true' }
      });

      isLoading.value = false;
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

    <div v-else-if="isLoggedIn" class="logged-in-content">
      <h1>함께 만들어가는 가계부, Co-Note!</h1>
      <p class="subtitle">시작할 준비가 되었어요.</p>
      <div class="start-buttons">
        <div v-if="groupCount > 0">
          <p class="status-message"><strong>{{ groupCount }}개의</strong> 가계부 그룹에 참여 중입니다.</p>
          <button @click="router.push('/groups')" class="start-btn primary">그룹 목록 보기</button>
        </div>

        <div v-else>
          <button @click="startCreating" class="start-btn primary">가계부 작성 시작하기</button>
        </div>
      </div>
    </div>

    <div v-else class="logged-out-content">
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
  justify-content: flex-start;
  align-items: center;
  min-height: calc(100vh - 60px);
  width: 100%;
  padding-top: 100px;
  text-align: center;
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

.status-message {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 15px;
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

.start-btn.primary,
.start-btn.group {
  background-color: #3498db;
  color: white;
}

.start-btn.primary:hover,
.start-btn.group:hover {
  background-color: #2980b9;
}
</style>