import { createRouter, createWebHistory } from "vue-router";
import Login from '../components/LoginPage.vue'
import Forgot from '../components/ForgotPage.vue'
import Reset from '../components/ResetPage.vue'
import Register from '../components/RegisterPage.vue'
import Notif from '../components/NotifPage.vue'
import Home from '../components/HomePage.vue'
import OpenCashier from '../components/CashierSessionPage.vue'
import CloseCashier from '../components/CloseCashierPage.vue'
import Cashier from '../components/CashierPage.vue'
import Product from '../components/ProductPage.vue'
import AddProduct from '../components/AddProductPage.vue'
import AddCategory from '../components/AddCategoryPage.vue'
import AddBrand from '../components/AddBrandPage.vue'
import Transaction from '../components/TransactionPage.vue'

const routes = [
    {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
    },
    {
    path: '/login',
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
    {
    path: '/open-cashier',
    name: 'cashier',
    component: OpenCashier
    },
    {
    path: '/close-cashier',
    name: 'cashierClose',
    component: CloseCashier
    },
    {
    path: '/cashier',
    name: 'cashierOpen',
    component: Cashier
    },
    {
    path: '/product',
    name: 'product',
    component: Product
    },
    {
    path: '/transaction',
    name: 'transaction',
    component: Transaction
    },
    {
    path: '/add-product',
    name: 'addProduct',
    component: AddProduct
    },
    {
    path: '/add-category',
    name: 'addCategory',
    component: AddCategory
    },
    {
    path: '/add-brand',
    name: 'addBrand',
    component: AddBrand
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    if(to.meta.requiresAuth && !token){
        next('/login')
    }else{
        next()
    }
})

export default router