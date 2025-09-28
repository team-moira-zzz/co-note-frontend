<script setup>
import TheHeader from './components/TheHeader.vue';
import { RouterView } from 'vue-router'; 
</script>

<template>
  <TheHeader /> 
  <main class="content-body">
    <RouterView />
  </main>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.content-body {
    padding-top: 20px;
}
</style>