<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
// 💡 logout 함수 임포트 추가
import { getAccessToken, logout } from '@/stores/authStore';

const router = useRouter();

const groupName = ref('');
const groupDescription = ref('');
const isSubmitting = ref(false);

const createGroup = async () => {
    // [1] 유효성 검사
    if (groupName.value.trim() === '') {
        alert('가계부 그룹 이름을 입력해주세요.');
        return;
    }

    // [2] 요청 본문 생성
    const requestBody = {
        name: groupName.value.trim(),
        description: groupDescription.value.trim()
    };

    // [3] AccessToken 추출
    const token = getAccessToken();
    isSubmitting.value = true;

    try {
        // [4] 백엔드 API 호출 (Authorization 헤더 포함)
        await axios.post('http://localhost:8080/api/book/group', requestBody, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        alert("가계부 그룹이 성공적으로 생성되었습니다!");

        // [5] 메인 페이지로 이동
        router.push('/');
    } catch (error) {
        console.error("그룹 생성 실패:", error);

        if (error.response && error.response.status === 401) {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');

            logout();
            router.push({ path: '/login', query: { expired: 'true' } });
            return;
        }

        const message = error.response?.data?.message || '그룹 생성 중 오류가 발생했습니다. 다시 시도해 주세요.';
        alert(`생성 실패: ${message}`);
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="create-group-container">
        <h1>새 가계부 그룹 만들기</h1>
        <p class="subtitle">함께 사용할 가계부의 이름과 설명을 입력해주세요.</p>

        <form @submit.prevent="createGroup" class="group-form">
            <div class="form-group">
                <label for="group-name">그룹 이름 <span class="required">*</span></label>
                <input id="group-name" type="text" v-model="groupName" placeholder="예: 우리집 공동 경비, 2025년 여행 자금"
                    required />
            </div>

            <div class="form-group">
                <label for="group-description">설명</label>
                <textarea id="group-description" v-model="groupDescription" placeholder="그룹의 목표, 규칙 등 자세한 설명을 적어보세요."
                    rows="4"></textarea>
            </div>

            <button type="submit" :disabled="isSubmitting" class="create-btn primary">
                {{ isSubmitting ? '생성 중...' : '그룹 생성하기' }}
            </button>
        </form>
    </div>
</template>

<style scoped>
.create-group-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: calc(100vh - 60px);
    padding-top: 80px;
    width: 100%;
}

h1 {
    font-size: 2em;
    color: #333;
    margin-bottom: 5px;
}

.subtitle {
    font-size: 1.1em;
    color: #666;
    margin-bottom: 40px;
}

.group-form {
    width: 100%;
    max-width: 500px;
    padding: 30px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    font-weight: bold;
    margin-bottom: 8px;
    color: #2c3e50;
}

.required {
    color: #e74c3c;
    font-size: 1.2em;
}

input[type="text"],
textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1em;
    box-sizing: border-box;
    transition: border-color 0.2s;
    font-family: inherit;
}

input[type="text"]:focus,
textarea:focus {
    border-color: #3498db;
    outline: none;
}

textarea {
    resize: vertical;
}

.create-btn {
    width: 100%;
    padding: 15px;
    font-size: 1.1em;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.create-btn.primary {
    background-color: #3498db;
    color: white;
}

.create-btn.primary:hover:not(:disabled) {
    background-color: #2980b9;
}

.create-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}
</style>