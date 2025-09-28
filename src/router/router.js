import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import KakaoCallbackView from '../views/KakaoCallbackView.vue'
import NaverCallbackView from '../views/NaverCallbackView.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    {
        path: '/login/kakao/callback',
        name: 'kakao-callback',
        component: KakaoCallbackView
    },
    {
        path: '/login/naver/callback',
        name: 'naver-callback',
        component: NaverCallbackView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router