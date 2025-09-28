<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { login } from '@/stores/authStore';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

onMounted(async () => {
    // [1] URL에서 인가 코드 추출
    const code = route.query.code;

    // [2] 인가 코드가 유효하지 않으면 로그인 페이지로 이동
    if (!code) {
        console.error('인가 코드가 URL에서 발견되지 않았습니다. 로그인 실패.');
        router.replace('/login');
        return;
    }

    try {
        // [3] 백엔드 API 호출
        const response = await axios.post('http://localhost:8080/api/login/kakao', { code: code });

        // [4] 응답에서 AccessToken 추출
        const atk = response.data;

        // [5-1] AccessToken이 유효하면 localStorage에 저장 후 메인 페이지로 이동
        if (atk) {
            login(atk);
            router.replace('/');
        }
        // [5-2] AccessToken이 유효하지 않으면 로그인 페이지로 이동
        else {
            console.error('백엔드 응답에 유효한 토큰이 없습니다.', response.data);
            router.replace('/login?error=invalid-token');
        }

    } catch (error) {
        console.error('로그인 처리 중 오류 발생:', error);
        router.replace('/login?error=network');
    }
});
</script>

<template>
    <div class="loading-container">
        <p>로그인 처리 중입니다... 잠시만 기다려주세요.</p>
    </div>
</template>