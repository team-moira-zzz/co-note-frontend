import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import KakaoCallbackView from '../views/KakaoCallbackView.vue'
import NaverCallbackView from '../views/NaverCallbackView.vue'
import GroupCreateView from '../views/GroupCreateView.vue'
import AccountBookView from '../views/AccountBookView.vue'

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
    },
    {
        path: '/group/create',
        name: 'create-group',
        component: GroupCreateView
    },
    {
        path: '/book',
        name: 'account-book',
        component: AccountBookView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router