<script setup>
import { useRouter } from 'vue-router';
import { isLoggedIn } from '@/stores/authStore'; 

const router = useRouter();

const startApp = () => {
    router.push('/login');
};

const startSolo = () => {
    console.log("혼자 작성할래요 클릭됨.");
};

const startGroup = () => {
    console.log("같이 작성할래요 클릭됨.");
};
</script>

<template>
  <div class="home-container">
    <div v-if="isLoggedIn" class="logged-in-content">
      <h1>같이 작성하는 가계부, 'Co-Note' 입니다.</h1>
      <p class="subtitle">지금 시작하세요!</p>
      
      <div v-if="false" class="group-list">
        </div>
      
      <div v-else class="start-buttons">
        <button @click="startSolo" class="start-btn solo">혼자 작성할래요</button>
        <button @click="startGroup" class="start-btn group">같이 작성할래요</button>
      </div>
    </div>
    
    <div v-else class="logged-out-content">
      <h1>같이 작성하는 가계부, 'Co-Note' 입니다!</h1>
      <p class="subtitle">지금 시작하세요.</p>
      <button @click="startApp" class="start-btn primary">시작하기</button>
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
  gap: 20px;
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

.start-btn.primary, .start-btn.group {
  background-color: #3498db;
  color: white;
}

.start-btn.solo {
  background-color: #bdc3c7;
  color: #333;
}

.start-btn.primary:hover, .start-btn.group:hover {
  background-color: #2980b9;
}

.start-btn.solo:hover {
    background-color: #95a5a6;
}
</style>