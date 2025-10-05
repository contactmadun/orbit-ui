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
import ListProduct from '../components/ListProduct.vue'
import TopupFund from '../components/TopupFundPage.vue'
import TransferFund from '../components/TransferFundPage.vue'
import Finance from '../components/FinancePage.vue'
import FinanceExpanse from '../components/FinanceExpanse.vue'
import FinanceIncome from '../components/FinanceIncome.vue'
import Setting from '../components/SettingPage.vue'
import Report from '../components/ReportPage.vue'
import ListBon from '../components/ListBonPage.vue'

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
    path: '/finance',
    name: 'finance',
    component: Finance
    },
    {
    path: '/expanse',
    name: 'expanse',
    component: FinanceExpanse
    },
    {
    path: '/income',
    name: 'income',
    component: FinanceIncome
    },
    {
    path: '/report',
    name: 'report',
    component: Report
    },
    {
    path: '/topup-fund',
    name: 'topupFund',
    component: TopupFund
    },
    {
    path: '/transfer-fund',
    name: 'transferFund',
    component: TransferFund
    },
    {
    path: '/product',
    name: 'product',
    component: Product
    },
    {
    path: '/list-product',
    name: 'listProduct',
    component: ListProduct
    },
    {
    path: '/list-bon',
    name: 'listBon',
    component: ListBon
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
    {
    path: '/setting',
    name: 'setting',
    component: Setting
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