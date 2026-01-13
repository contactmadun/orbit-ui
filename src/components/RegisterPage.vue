<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../axios'
// import Input from './ui/input/Input.vue'
// import Button from './ui/button/Button.vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()

const showPassword = ref(false)
const msg = ref("");
const emailError = ref("");
const form = ref({
    name: "",
    outlet: "",
    number: "",
    email: "",
    password: ""
})

const handleRegist = async () => {
    try {
        const res = await api.post("users", form.value)
        msg.value = res.data.message
        console.log(res.data)

        //redirect
        router.push({
            path: '/login',
            query: { msg: msg.value }
        })
    } catch (error) {
        console.log(error)
        if (error.response?.data?.message === "Email sudah terdaftar!"){
            emailError.value = error.response.data.message
        }
    }
}
</script>

<template>
  <div class="h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">

    <!-- LEFT SIDE (DESKTOP ONLY) -->
    <div class="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-blue-500 text-white">
      <div>
        <h1 class="text-5xl font-bold mb-6 mt-36">
          Mulai Bisnismu<br />
          <span class="text-blue-300">Dengan Orbit POS.</span>
        </h1>

        <p class="text-white max-w-md mb-10 text-lg">
          Buat akun sekarang dan kelola outlet, transaksi, serta laporan bisnis
          Anda dalam satu dashboard yang aman dan terintegrasi.
        </p>

        <ul class="space-y-4 text-lg">
          <li class="flex items-center gap-3">
            • Satu akun untuk multi outlet
          </li>
          <li class="flex items-center gap-3">
            • Data transaksi tersimpan aman
          </li>
          <li class="flex items-center gap-3">
            • Siap dipakai untuk bisnis berkembang
          </li>
        </ul>
      </div>
    </div>

    <!-- RIGHT SIDE (FORM REGISTER) -->
    <div class="flex items-start lg:items-center justify-center px-6 pt-10 lg:pt-0">
      <div class="w-full max-w-md">

        <h2 class="text-center lg:text-start text-3xl text-gray-800 font-bold mb-2">
          Buat Akun Baru
        </h2>

        <p class="text-center lg:text-start text-base text-gray-400 mb-6">
          Lengkapi data di bawah untuk mulai menggunakan Orbit POS.
        </p>

        <form @submit.prevent="handleRegist" class="space-y-4">

          <div>
            <label class="font-semibold text-gray-800">Nama Lengkap</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Fulan"
              required
              class="block w-full p-3 mt-2 rounded-xl border border-gray-200
                     focus:outline-none focus:ring-2 focus:ring-blue-400
                     bg-gray-50"
            />
          </div>

          <div>
            <label class="font-semibold text-gray-800">Nama Outlet</label>
            <input
              v-model="form.outlet"
              type="text"
              placeholder="Orbit Cell"
              required
              class="block w-full p-3 mt-2 rounded-xl border border-gray-200
                     focus:outline-none focus:ring-2 focus:ring-blue-400
                     bg-gray-50"
            />
          </div>

          <div>
            <label class="font-semibold text-gray-800">Nomor WhatsApp</label>
            <input
              v-model="form.number"
              type="tel"
              inputmode="numeric"
              placeholder="0821xxxx"
              required
              class="block w-full p-3 mt-2 rounded-xl border border-gray-200
                     focus:outline-none focus:ring-2 focus:ring-blue-400
                     bg-gray-50"
            />
          </div>

          <div>
            <label class="font-semibold text-gray-800">Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="emailkamu@mail.com"
              required
              class="block w-full p-3 mt-2 rounded-xl border border-gray-200
                     focus:outline-none focus:ring-2 focus:ring-blue-400
                     bg-gray-50"
            />
            <p v-if="emailError" class="text-red-500 text-sm mt-1">
              {{ emailError }}
            </p>
          </div>

          <div>
            <label class="font-semibold text-gray-800">Kata Sandi</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="block w-full p-3 mt-2 rounded-xl border border-gray-200
                       focus:outline-none focus:ring-2 focus:ring-blue-400
                       bg-gray-50 pr-10"
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

          <button
            type="submit"
            class="w-full py-2 lg:py-4 bg-blue-700 text-white font-bold text-lg
                   rounded-2xl hover:bg-blue-900 hover:-translate-y-0.5
                   transition-all duration-200 shadow-lg"
          >
            Daftar Sekarang
          </button>

          <div class="text-center text-base text-gray-400">
            Sudah punya akun?
            <RouterLink
              to="/login"
              class="text-sm font-semibold text-blue-600 hover:underline hover:text-blue-900"
            >
              Masuk
            </RouterLink>
          </div>

        </form>
      </div>
    </div>

  </div>
</template>
