<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { isLoggedIn, getAccessToken, logout } from '@/stores/authStore';
import CalendarComponent from '@/components/CalendarComponent.vue';

const router = useRouter();
const groupCount = ref(null);
const isLoading = ref(true);

const selectedDate = ref(null);  // 선택된 날짜 (YYYY-MM-DD)
const entryList = ref([]);       // 가계부 항목 리스트

// 비로그인 사용자: '로그인하고 시작하기' 버튼 클릭 시
const goToLogin = () => {
  router.push('/login');
};

// 로그인 사용자: '가계부 작성 시작하기' 버튼 클릭 시 (가입된 그룹이 없을 때)
const startCreating = () => {
  router.push('/group/create');
};

// 일별 가계부 항목 조회 (API 호출)
const fetchEntriesByDate = async (date) => {
  selectedDate.value = date;
  console.log(`선택된 날짜: ${date}`);

  if (!isLoggedIn.value) {
    entryList.value = [];
    return;
  }

  try {
    const token = getAccessToken();
    if (!token) throw new Error("토큰이 없습니다.");

    const response = await axios.get(`http://localhost:8080/api/book/entries/daily`, {
      params: {
        date: date
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    entryList.value = response.data;
  } catch (error) {
    console.error("가계부 항목 조회 API 호출 실패:", error);

    if (error.response && error.response.status === 401) {
      logout();
      router.push({ path: '/login', query: { expired: 'true' } });
      return;
    }

    entryList.value = [];
  }
};

// 특정 유저의 그룹 가입 여부 조회 (API 호출)
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
  } catch (error) {
    console.error("그룹 수 조회 API 호출 실패:", error);

    if (error.response && error.response.status === 401) {
      logout();
      router.push({ path: '/login', query: { expired: 'true' } });
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
      <div v-if="groupCount > 0" class="main-content-area">
        <CalendarComponent @dateSelected="fetchEntriesByDate" />

        <div class="entry-list-area">
          <h2 class="list-header">{{ selectedDate }} 가계부 항목</h2>

          <div class="entry-grid-container">
            <div class="entry-grid-header">
              <span class="grid-col type">구분</span>
              <span class="grid-col content">내용</span>
              <span class="grid-col description">세부항목</span>
              <span class="grid-col category">카테고리</span> <span class="grid-col price">금액</span>
              <span class="grid-col user">작성자</span>
            </div>

            <div v-if="entryList.length > 0">
              <div v-for="entry in entryList" :key="entry.id" class="entry-grid-row">
                <span :class="['grid-col type', entry.type.toLowerCase()]">{{ entry.type === 'INCOME' ? '수입' : '지출'
                }}</span>
                <span class="grid-col content">{{ entry.content }}</span>
                <span class="grid-col description">{{ entry.description }}</span>
                <span class="grid-col category">{{ entry.categoryName }}</span> <span class="grid-col price">{{
                  entry.price.toLocaleString() }}원</span>
                <span class="grid-col user">{{ entry.userName }}</span>
              </div>
            </div>
            <div v-else class="no-entries">
              선택된 날짜에 가계부 항목이 없습니다.
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <h1>함께 만들어가는 가계부, Co-Note!</h1>
        <p class="subtitle">시작할 준비가 되었어요.</p>
        <div class="start-buttons">
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
  align-items: center;
  min-height: calc(100vh - 60px);
  width: 100%;
  padding-top: 50px;
  background-color: white;
  text-align: center;
}

.logged-in-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.main-content-area {
  width: 100%;
  max-width: 800px;
  padding: 0 20px;
}

.entry-list-area {
  width: 100%;
  max-width: 800px;
  margin: 30px auto 0;
  text-align: left;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.list-header {
  font-size: 1.4em;
  color: #34495e;
  margin-bottom: 15px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.entry-grid-container {
  display: flex;
  flex-direction: column;
}

.entry-grid-header,
.entry-grid-row {
  display: grid;
  grid-template-columns: 0.7fr 2.5fr 1.5fr 1.2fr 1.5fr 0.8fr;
  padding: 10px 0;
  align-items: center;
}

.entry-grid-header {
  font-weight: bold;
  color: #555;
  border-bottom: 1px solid #ddd;
  background-color: #f9f9f9;
}

.entry-grid-row {
  border-bottom: 1px dashed #eee;
  font-size: 0.95em;
}

.entry-grid-row:last-child {
  border-bottom: none;
}

.grid-col {
  padding: 0 5px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  text-align: right;
}

.type.income {
  color: #2ecc71;
  font-weight: bold;
}

.type.expense {
  color: #e74c3c;
  font-weight: bold;
}

.no-entries {
  text-align: center;
  padding: 20px 0;
  color: #999;
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