import { createRouter, createWebHistory } from "vue-router";
import Login from '../components/LoginPage.vue'
import Forgot from '../components/ForgotPage.vue'

const routes = [
    {
    path: '/',
    name: 'Login',
    component: Login
    },
    {
    path: '/forgot-password',
    name: 'forgot',
    component: Forgot
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router