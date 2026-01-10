<script setup>
// import Label from './ui/label/Label.vue'
// import Input from './ui/input/Input.vue'
// import Button from './ui/button/Button.vue'
import { useUserStore } from '@/stores'
import { Rocket, Eye, EyeOff } from 'lucide-vue-next'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import api from '../axios'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const msg = ref("")

const errorMessage = ref("")
const email = ref("")
const password = ref("")
const showPassword = ref(false)

onMounted(() => {
    if(route.query.msg){
        msg.value = route.query.msg
    }

    setTimeout(() => {
        msg.value = ""
    }, 5000)
})

const handleLogin = async () => {
    try {
        // console.log(email.value);
        // console.log(password.value);
        const res = await api.post("users/login", {
            email: email.value,
            password: password.value
        })

        localStorage.setItem("token", res.data.token)
        userStore.setToken(res.data.token)
        userStore.setUser(res.data.user)
        router.push("/")
    } catch (error) {
        errorMessage.value = error.response.data.message
        // console.error(err.response?.data || err.message)
        // msg.value = err.response?.data?.message || "Login gagal"
    }
}
</script>

<template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2">
    
    <!-- LEFT SIDE (Branding) -->
    <div class="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-blue-500 text-white">
      <div>
        <h1 class="text-5xl font-bold mb-6 mt-45">
          Kelola Konter<br /> <span class="text-blue-300">Lebih Profesional.</span>
        </h1>
        <p class="text-white max-w-md mb-10 text-lg">
          Hentikan pencatatan manual yang melelahkan. Bergabunglah dengan jaringan pebisnis digital yang mengandalkan Orbit POS untuk otomatisasi laporan keuangan dan stok.
        </p>

        <ul class="space-y-4 ">
          <li class="flex items-center gap-3 text-lg">
            <Check class="w-5 h-5" />
            Pantau transaksi dari mana saja.
          </li>
          <li class="flex items-center gap-3 text-lg">
            <Check class="w-5 h-5" />
            Melindungi privasi dan histori transaksi bisnis Anda.
          </li>
          <li class="flex items-center gap-3 text-lg">
            <Check class="w-5 h-5" />
             Manajemen inventaris produk yang rapi.
          </li>
        </ul>
      </div>
    </div>

    <!-- RIGHT SIDE (Login Form) -->
    <div class="flex items-center justify-center px-6">
      <div class="w-full max-w-md">

        <!-- Alert -->
        <Transition
          enter-active-class="transition duration-500"
          enter-from-class="opacity-0 -translate-y-3"
          enter-to-class="opacity-100 translate-y-0"
        >
          <Alert v-if="msg" class="mb-6">
            <Rocket class="w-4 h-4" />
            <AlertTitle>Selamat</AlertTitle>
            <AlertDescription>{{ msg }}</AlertDescription>
          </Alert>
        </Transition>

        <h2 class="text-3xl text-gray-800 font-bold mb-1">
          Selamat Datang Kembali
        </h2>
        <p class="text-base text-gray-400 mb-6">
          Masuk ke dashboard untuk mengelola transaksi Anda.
        </p>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label for="email" class="font-semibold text-gray-800">Email</label>
            <input
              class="block w-full p-3 rounded-xl border border-grey-200 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-200 bg-gray-50"
              id="email"
              v-model="email"
              type="email"
              placeholder="akunmu@gmail.com"
              required
            />
          </div>

          <div>
            <div class="flex justify-between items-center">
              <label for="password" class="font-semibold text-gray-800">Kata Sandi</label>
              <RouterLink
                to="/forgot-password"
                class="text-sm font-semibold text-blue-600 hover:underline hover:text-blue-900"
              >
                Lupa Kata Sandi?
              </RouterLink>
            </div>

            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="block w-full p-3 rounded-xl border border-grey-200 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-200 bg-gray-50"
                required
              />
              <button
                type="button"
                class="absolute inset-y-0 right-3 flex items-center text-gray-500"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="!showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <p v-if="errorMessage" class="text-red-500 text-sm">
            {{ errorMessage }}
          </p>

          <button class="w-full py-4 bg-blue-700 text-white font-bold text-lg rounded-2xl hover:bg-blue-900 hover:translate-y-0.5 transition-all transform duration-200">
            Masuk
          </button>

          <div class="text-center text-base text-gray-400">
            Belum punya akun?
            <RouterLink
              to="/register"
              class="text-sm font-semibold text-blue-600 hover:underline hover:text-blue-900"
            >
              Daftar Gratis Sekarang
            </RouterLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
