<script setup>
// import Label from './ui/label/Label.vue'
// import Input from './ui/input/Input.vue'
// import Button from './ui/button/Button.vue'
import { useUserStore } from "@/stores";
import { Rocket, Eye, EyeOff } from "lucide-vue-next";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import api from "../axios";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const msg = ref("");
const isLoading = ref(false);

const errorMessage = ref("");
const email = ref("");
const password = ref("");
const showPassword = ref(false);

onMounted(() => {
  if (route.query.msg) {
    msg.value = route.query.msg;
  }

  setTimeout(() => {
    msg.value = "";
  }, 5000);
});

const handleLogin = async () => {
  try {
    isLoading.value = true;

    const res = await api.post("users/login", {
      email: email.value,
      password: password.value,
    });
    // console.log(res.data.user)
    localStorage.setItem("token", res.data.token);
    userStore.setToken(res.data.token);
    userStore.setUser(res.data.user);
    router.push("/dashboard");
  } catch (error) {
    errorMessage.value = error.response.data.message;
    // console.error(err.response?.data || err.message)
    // msg.value = err.response?.data?.message || "Login gagal"
  } finally {
    isLoading.value = false;
  }
};

const slides = ref([
  {
    title: "Kelola Transaksi Lebih Cepat",
    subtitle: "POS Modern untuk Konter",
    description:
      "Catat penjualan pulsa, kuota, aksesoris, dan service hanya dalam hitungan detik. Tidak perlu pencatatan manual lagi.",
    highlight: "Transaksi real-time & akurat",
  },
  {
    title: "Pantau Stok dengan Mudah",
    subtitle: "Inventori Selalu Terkontrol",
    description:
      "Ketahui stok kartu perdana, aksesoris, dan produk lain secara otomatis. Kurangi risiko kehabisan barang.",
    highlight: "Manajemen stok otomatis",
  },
  {
    title: "Laporan Usaha Lebih Rapi",
    subtitle: "Keuangan Transparan",
    description:
      "Dapatkan laporan penjualan harian, mingguan, dan bulanan untuk membantu pengambilan keputusan bisnis.",
    highlight: "Laporan siap pakai",
  },
]);

const currentSlide = ref(0);

onMounted(() => {
  setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.value.length;
  }, 7000);
});
</script>

<template>
  <div class="h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
    <!-- LOADING OVERLAY -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isLoading"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div
          class="bg-white rounded-2xl p-8 w-64 flex flex-col items-center shadow-xl"
        >
          <!-- Spinner -->
          <div
            class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"
          ></div>

          <p class="text-gray-700 font-semibold">Memproses login...</p>
        </div>
      </div>
    </Transition>

    <!-- LEFT SIDE (SLIDESHOW) -->
    <div
      class="hidden lg:flex flex-col justify-between p-12 bg-gray-50 relative overflow-hidden"
    >
      <!-- Logo -->
      <div class="flex items-center gap-2 font-bold text-blue-900 text-xl">
        Orbit POS
      </div>

      <!-- Slide Content -->
      <Transition
        enter-active-class="transition-all duration-700"
        enter-from-class="opacity-0 translate-y-6"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-500 absolute"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-6"
        mode="out-in"
      >
        <div :key="currentSlide" class="mt-20">
          <!-- Dummy Card Visual (seperti referensi) -->
          <div class="flex gap-6 mb-10">
            <div
              class="w-28 h-20 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 font-bold"
            >
              Rp 24.359
            </div>
            <div
              class="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center font-bold"
            >
              34%
            </div>
          </div>

          <h1 class="text-4xl font-bold text-gray-800 mb-3">
            {{ slides[currentSlide].title }}
          </h1>

          <h2 class="text-xl text-blue-800 font-semibold mb-4">
            {{ slides[currentSlide].subtitle }}
          </h2>

          <p class="text-gray-500 max-w-md mb-6">
            {{ slides[currentSlide].description }}
          </p>

          <span
            class="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold"
          >
            {{ slides[currentSlide].highlight }}
          </span>
        </div>
      </Transition>

      <!-- Pagination Dots -->
      <div class="flex items-center gap-2">
        <button
          v-for="(slide, index) in slides"
          :key="index"
          @click="currentSlide = index"
          class="w-2.5 h-2.5 rounded-full transition-all"
          :class="currentSlide === index ? 'bg-blue-800 w-6' : 'bg-gray-300'"
        />
      </div>
    </div>

    <!-- RIGHT SIDE (Login Form) -->
    <div class="flex lg:items-center justify-center px-6 pt-28 lg:pt-0">
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

        <h2
          class="text-center lg:text-start text-3xl text-gray-800 font-bold mb-1"
        >
          Selamat Datang Kembali
        </h2>
        <p
          class="text-center lg:text-start text-base text-gray-400 mb-6 lg:mb-6"
        >
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
              <label for="password" class="font-semibold text-gray-800"
                >Kata Sandi</label
              >
              <RouterLink
                to="/forgot-password"
                class="text-sm font-semibold text-blue-700 hover:underline hover:text-blue-900"
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

          <button
            :disabled="isLoading"
            class="w-full py-2 lg:py-4 bg-blue-700 text-white font-bold text-lg rounded-2xl hover:bg-blue-900 hover:translate-y-0.5 transition-all transform duration-200 shadow-lg"
          >
            Masuk
          </button>

          <div class="text-center text-base text-gray-400">
            Belum punya akun?
            <RouterLink
              to="/register"
              class="text-sm font-semibold text-blue-700 hover:underline hover:text-blue-900"
            >
              Daftar Gratis Sekarang
            </RouterLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
