<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { isLoggedIn, getAccessToken, logout } from '@/stores/authStore';

import CalendarComponent from '@/components/CalendarComponent.vue';
import EntryModal from '@/components/EntryModal.vue';

const router = useRouter();

const selectedDate = ref(null);
const entryList = ref([]);

const isModalOpen = ref(false);
const modalData = ref(null);

// 일별 가계부 항목 조회
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

        if (error.response && error.response.status === 403) {
            alert('가계부 그룹에 접근 권한이 없습니다. 그룹 관리 페이지로 이동합니다.');
            router.push('/');
            return;
        }

        entryList.value = [];
    }
};

// '항목 추가' 버튼 클릭 시 모달 오픈
const openAddModal = () => {
    if (!selectedDate.value) {
        alert("먼저 달력에서 항목을 추가할 날짜를 선택해주세요.");
        return;
    }
    modalData.value = null;
    isModalOpen.value = true;
};

// '항목 추가'가 완료되면 재조회
const handleEntrySaved = () => {
    isModalOpen.value = false;
    if (selectedDate.value) {
        fetchEntriesByDate(selectedDate.value);
    }
};

onMounted(() => {
    if (!isLoggedIn.value) {
        router.push('/');
    }
});
</script>

<template>
    <div class="account-book-container">
        <div class="main-content-area">
            <CalendarComponent @dateSelected="fetchEntriesByDate" />

            <div class="entry-list-area">
                <div class="list-actions">
                    <h2 class="list-header">{{ selectedDate }} 가계부 항목</h2>
                    <button class="add-btn" @click="openAddModal" v-if="selectedDate">항목 추가</button>
                </div>

                <div class="entry-grid-container">
                    <div class="entry-grid-header">
                        <span class="grid-col type">구분</span>
                        <span class="grid-col content">내용</span>
                        <span class="grid-col description">세부항목</span>
                        <span class="grid-col category">카테고리</span>
                        <span class="grid-col price">금액</span>
                        <span class="grid-col user">작성자</span>
                    </div>

                    <div v-if="entryList.length > 0">
                        <div v-for="entry in entryList" :key="entry.id" class="entry-grid-row">
                            <span :class="['grid-col type', entry.type.toLowerCase()]">{{ entry.type === 'INCOME' ? '수입'
                                : '지출'
                            }}</span>
                            <span class="grid-col content">{{ entry.content }}</span>
                            <span class="grid-col description">{{ entry.description }}</span>
                            <span class="grid-col category">{{ entry.categoryName }}</span>
                            <span class="grid-col price">{{ entry.price.toLocaleString() }}원</span>
                            <span class="grid-col user">{{ entry.userNickname }}</span>
                        </div>
                    </div>
                    <div v-else class="no-entries">
                        선택된 날짜에 가계부 항목이 없습니다.
                    </div>
                </div>
            </div>
        </div>

        <EntryModal v-if="isModalOpen" :initial-data="modalData" :selected-date="selectedDate"
            @close="isModalOpen = false" @entry-saved="handleEntrySaved" />
    </div>
</template>

<style scoped>
.account-book-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: calc(100vh - 60px);
    width: 100%;
    padding-top: 50px;
    background-color: white;
    text-align: center;
}

.main-content-area {
    width: 100%;
    max-width: 1000px;
    padding: 0 20px;
}

.entry-list-area {
    width: 100%;
    max-width: none;
    margin: 30px auto 0;
    text-align: left;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.list-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
}

.list-header {
    font-size: 1.4em;
    color: #34495e;
    margin-bottom: 0;
    border-bottom: none;
    padding-bottom: 0;
}

.add-btn {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background-color 0.2s;
}

.add-btn:hover {
    background-color: #2980b9;
}

.entry-grid-container {
    display: flex;
    flex-direction: column;
}

.entry-grid-header,
.entry-grid-row {
    grid-template-columns: 0.7fr 2.0fr 1.2fr 1.0fr 1.5fr 0.8fr;
    padding: 10px 0;
    align-items: center;
    display: grid;
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
</style>