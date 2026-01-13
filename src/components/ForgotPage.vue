<script setup>
// import Label from './ui/label/Label.vue'
// import Input from './ui/input/Input.vue'
// import Button from './ui/button/Button.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import api from '../axios'

const router = useRouter();

const email = ref("")
const msg = ref("")
const emailError = ref("");

const handleReset = async () => {
    try {
        const res = await api.post("users/reset-password", {
            email: email.value
        });
        msg.value = res.data.message

        router.push({
            path: '/login',
            query: { msg: msg.value }
        })
    } catch (error) {
        console.log(error);
        if (error.response?.data?.message === "Email tidak ditemukan"){
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
        <h1 class="text-5xl font-bold mb-6 mt-40">
          Lupa Kata Sandi?<br />
          <span class="text-blue-300">Tenang, Kami Bantu.</span>
        </h1>

        <p class="text-white max-w-md mb-10 text-lg">
          Masukkan email yang terdaftar di Orbit POS. Kami akan mengirimkan
          tautan untuk mengatur ulang kata sandi akun Anda dengan aman.
        </p>

        <ul class="space-y-4 text-lg">
          <li class="flex items-center gap-3">
            • Proses cepat & aman
          </li>
          <li class="flex items-center gap-3">
            • Link reset dikirim ke email terdaftar
          </li>
          <li class="flex items-center gap-3">
            • Lindungi akses akun bisnis Anda
          </li>
        </ul>
      </div>
    </div>

    <!-- RIGHT SIDE (FORM) -->
    <div class="flex items-start lg:items-center justify-center px-6 pt-10 lg:pt-0">
      <div class="w-full max-w-md">

        <h2 class="text-center lg:text-start text-3xl text-gray-800 font-bold mb-2">
          Reset Kata Sandi
        </h2>

        <p class="text-center lg:text-start text-base text-gray-400 mb-6">
          Masukkan email yang terdaftar untuk menerima link reset password.
        </p>

        <form @submit.prevent="handleReset" class="space-y-5">

          <div>
            <label for="email" class="font-semibold text-gray-800">
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="emailkamu@mail.com"
              required
              class="block w-full p-3 rounded-xl border border-gray-200 mt-2
                     focus:outline-none focus:ring-2 focus:ring-blue-400
                     focus:border-blue-200 bg-gray-50"
            />
            <p v-if="emailError" class="text-red-500 text-sm mt-1">
              {{ emailError }}
            </p>
          </div>

          <button
            type="submit"
            class="w-full py-2 lg:py-4 bg-blue-700 text-white font-bold text-lg
                   rounded-2xl hover:bg-blue-900 hover:-translate-y-0.5
                   transition-all duration-200 shadow-lg"
          >
            Kirim Link Reset
          </button>

          <div class="text-center text-base text-gray-400">
            Ingat kata sandi?
            <RouterLink
              to="/login"
              class="text-sm font-semibold text-blue-600 hover:underline hover:text-blue-900"
            >
              Kembali ke Login
            </RouterLink>
          </div>

        </form>
      </div>
    </div>

  </div>
</template>
