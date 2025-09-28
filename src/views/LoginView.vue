<script setup>

// 카카오 로그인 버튼 클릭 시
const handleKakaoLogin = () => {
    window.location.href = 'http://localhost:8080/api/login/kakao/login-url'; 
};

// 네이버 로그인 버튼 클릭 시
const handleNaverLogin = () => {
    window.location.href = 'http://localhost:8080/api/login/naver/login-url'; 
};
</script>

<template>
    <div class="login-container">
        <h1>Co-Note 로그인</h1>

        <div class="button-group">
            <button class="social-button kakao" @click="handleKakaoLogin">
                <img src="../assets/kakao_login_button.png" alt="카카오 로그인" class="login-logo" />
            </button>

            <button class="social-button naver" @click="handleNaverLogin">
                <img src="../assets/naver_login_button.png" alt="네이버 로그인" class="login-logo" />
            </button>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    gap: 20px;
}

h1 {
    font-size: 2em;
    color: #333;
    margin-bottom: 20px;
}

.button-group {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 300px;
}

.social-button {
    border: none;
    padding: 0;
    cursor: pointer;
    background: none;
    transition: opacity 0.2s;
    width: 100%;
}

.social-button:hover {
    opacity: 0.9;
}

.login-logo {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 6px;
}
</style>