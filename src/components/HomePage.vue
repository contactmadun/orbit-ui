<script setup>
// import Label from './ui/label/Label.vue'
// import Input from './ui/input/Input.vue' 
import { Card, CardContent } from './ui/card'
import Button from './ui/button/Button.vue'
import { Bell, User, TrendingUp } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores'

const userStore = useUserStore();
const router = useRouter()
const loading = ref(false)

const currentDateTime = ref('')

const updateDateTime = () => {
  const now = new Date()

  const formatter = new Intl.DateTimeFormat(navigator.language || 'id-ID', {
    // weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  currentDateTime.value = formatter.format(now)
}

let intervalId

onMounted(() => {
  updateDateTime()
  intervalId = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})


const handleLogout = async () => {
  try {
    loading.value = true
    // hapus token di localStorage
    localStorage.removeItem("token")
    // redirect ke login
    router.push("/login")
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false
  }
}

const props = defineProps({
  title: { type: String, required: true},
  value: { type: Number, required: true},
  growth: { type: Number, default: 0},
  percentage: { type: Number, required: true},
  conditions: { type: String, required: true}
})

</script>

<template>
    <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-8 px-5">
      <div class="flex justify-between items-center w-full">
      <div class="flex flex-col">
        <h1 class="text-xl font-medium">Halo👋</h1>
        <h6>{{ userStore.user?.name || "Pengguna" }}</h6>
      </div>
      <Bell class="w-5 h-5 cursor-pointer" />
      </div>  
      <Card class="w-full max-w-sm shadow-md mt-5 rounded-2xl text-white bg-gray-900">
        <CardContent class="px-3 flex flex-col gap-3">
          <!-- Header -->
          <div class="flex justify-between items-center">
            <div class="flex flex-col gap-2">
              <h2 class="text-base font-medium">Ayo Buka Kasir</h2>
              <p class="text-sm text-gray-400">{{ currentDateTime }}</p>
            </div>
            <Button variant="outline" size="sm" class="px-4 py-5 text-black">Buka Kasir</Button>
          </div>
        </CardContent>
      </Card>
      <Card class="w-full max-w-sm shadow-md mt-5 rounded-2xl">
        <CardContent class="px-5 pb-3 flex flex-col gap-3">
          <!-- Header -->
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
            <TrendingUp class="w-5 h-5 text-gray-500" />
            <h2 class="text-lg font-medium">Keuntungan</h2>
          </div>
            <Button variant="outline" size="sm" class="px-4 py-5">Lihat Detail</Button>
          </div>

          <!-- Value -->
          <div class="flex items-center gap-3">
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-bold">Rp250.000</span>
              <span class="text-green-500 font-medium text-sm">+2000</span>
            </div>
          </div>

          <!-- Info -->
          <p class="text-sm text-gray-600">
            <span class="font-bold">58%</span> lebih tinggi dari hari kemarin
          </p>
        </CardContent>
      </Card>
      <button @click="handleLogout" class="underline" :disabled="loading">{{ loading ? "Proses logout..." : "logout" }}</button>
    </div>
</template>