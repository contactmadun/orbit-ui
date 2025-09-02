import { createRouter, createWebHistory } from "vue-router";
import Login from '../components/LoginPage.vue'
import Forgot from '../components/ForgotPage.vue'
import Reset from '../components/ResetPage.vue'
import Register from '../components/RegisterPage.vue'
import Notif from '../components/NotifPage.vue'

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
    {
    path: '/reset-password',
    name: 'reset',
    component: Reset
    },
    {
    path: '/register',
    name: 'register',
    component: Register
    },
    {
    path: '/notif',
    name: 'notif',
    component: Notif
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router