<script setup>
// import Label from './ui/label/Label.vue'
// import Input from './ui/input/Input.vue' 
import { Card, CardContent } from './ui/card'
import Button from './ui/button/Button.vue'
import { Bell, User, TrendingUp, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useUserStore } from '@/stores'
import BottomNav from './reusable/BottomNav.vue'
import RecentTrx from './reusable/RecentTransactions.vue'
import MainMenu from './reusable/MainMenu.vue'
import FinancialReport from './reusable/FinancialReport.vue'
import TransactionReport from './reusable/TransactionReport.vue'
import api from '../axios'

const userStore = useUserStore();
const cashierSession = ref(null)

const value = 250
const difference = -421
const months = [
  { name: 'Apr', value: 20 },
  { name: 'May', value: 30 },
  { name: 'Jun', value: 25 },
  { name: 'Jul', value: 50, active: true }
]

const fetchCashierSession = async () => {
  if (!userStore.storeId) return
  try {
    const { data } = await api.get(`/cashier/session/${userStore.storeId}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    // asumsi backend return session aktif atau null
    cashierSession.value = data
  } catch (err) {
    console.error("Gagal fetch cashier session:", err)
  }
}

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
  fetchCashierSession()
})

onUnmounted(() => {
  clearInterval(intervalId)
})

const isOpen = computed(() => cashierSession.value?.status === "open")

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
            <div>
              <RouterLink
                v-if="isOpen"
                to="/close-cashier">
                <Button variant="outline" size="sm" class="px-4 py-5 text-black">Tutup Kasir</Button>
              </RouterLink>

              <RouterLink
                v-else
                to="/open-cashier">
                <Button variant="outline" size="sm" class="px-4 py-5 text-black">Buka Kasir</Button>
              </RouterLink>
            </div>
            <!-- <RouterLink to="/open-cashier">
              <Button variant="outline" size="sm" class="px-4 py-5 text-black">Buka Kasir</Button>
            </RouterLink> -->
          </div>
        </CardContent>
      </Card>
       <Card class="w-full max-w-sm shadow-md mt-5 rounded-2xl">
          <CardContent class="px-5 py-2 flex flex-col gap-4">
            
            <!-- Header -->
            <div class="flex justify-between items-center">
              <h2 class="text-md font-medium text-gray-800">Keuntungan</h2>
              <ChevronRight class="w-4 h-4 text-gray-500" />
            </div>

            <div class="flex">
              <!-- Value -->
              <div>
                <div class="flex items-start">
                  <span class="text-lg text-gray-800 font-semibold">Rp</span>
                  <span class="text-3xl font-bold">{{ value.toLocaleString() }}K</span>
                </div>
                <p class="text-sm text-gray-500 mt-4">
                  Your revenue 
                  <span v-if="difference < 0" class="text-red-500">decreased</span>
                  <span v-else class="text-green-500">increased</span>
                  this month by about 
                  <span class="font-medium text-red-500">${{ Math.abs(difference) }}</span>
                </p>
              </div>
  
              <!-- Mini Chart Dummy -->
              <div class="flex items-end gap-3 mt-2">
                <div v-for="m in months" :key="m.name" class="flex flex-col items-center gap-1">
                  <div
                    class="w-6 rounded-md"
                    :class="m.active ? 'bg-red-500' : 'bg-gray-200'"
                    :style="{ height: m.value + 'px' }"
                  ></div>
                  <span class="text-xs text-gray-500">{{ m.name }}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      <MainMenu class="mt-3" />
      <FinancialReport class="mt-5" />
      <TransactionReport class="mt-5" />
      <RecentTrx class="mt-5" />  
      <button @click="handleLogout" class="underline mt-80" :disabled="loading">{{ loading ? "Proses logout..." : "logout" }}</button>
      <p class="mt-50">percobaan</p>
      <BottomNav />
    </div>
</template>