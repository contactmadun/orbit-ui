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

const months = ref([]) // ganti nama jadi `days` mungkin lebih cocok
const loading = ref(true)
const profitToday = ref(0)
const totalProfit = ref(0)
const difference = ref(0) 
const isIncrease = ref(false)

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
  } finally {
    loadingSkelton.value = false;
  }
}

// 🔹 ambil profit dari API
const fetchProfitToday = async () => {
  const { data } = await api.get(`/transaction/profit/${userStore.storeId}`, {
    headers: { Authorization: `Bearer ${userStore.token}` }
  })
  return data.totalProfit || 0
}

const fetchReport = async () => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 3)

  const params = {
    storeId: userStore.storeId,
    startDate: start.toISOString(),
    endDate: end.toISOString()
  }

  const { data } = await api.get("/report/profit-limit", { params })
  return data.data || []
}

const router = useRouter()
const loadingSkelton = ref(true)

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

const loadData = async () => {
  try {
    loading.value = true
    const [reports, todayProfit] = await Promise.all([
      fetchReport(),
      fetchProfitToday()
    ])

    profitToday.value = todayProfit

    // mapping data dari reports (3 hari)
    const mappedReports = reports.map(r => ({
      name: new Date(r.date).getDate(),
      value: parseFloat(r.totalProfit),
      active: false
    }))

    // tambahkan data hari ini
    const today = new Date()
    mappedReports.push({
      name: today.getDate(),
      value: todayProfit,
      active: true // highlight hari ini
    })

    months.value = mappedReports
    console.log(months.value);

    // total profit = semua digabung
    totalProfit.value = mappedReports.reduce((a, b) => a + b.value, 0)

    // bandingkan profit hari ini dengan kemarin
    const yesterday = mappedReports[mappedReports.length - 2]?.value || 0
    difference.value = todayProfit - yesterday
    isIncrease.value = todayProfit > yesterday
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

let intervalId

const maxValue = computed(() => {
  return Math.max(...months.value.map(m => m.value || 0)) || 1
})

onMounted(() => {
  updateDateTime()
  intervalId = setInterval(updateDateTime, 1000)
  fetchCashierSession()
  loadData()
})

onUnmounted(() => {
  clearInterval(intervalId)
})

const isOpen = computed(() => cashierSession.value?.status === "open")

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
      <Card class="w-full shadow-md mt-5 rounded-2xl text-white bg-gray-900">
    <CardContent class="px-3 flex flex-col gap-3">
      <!-- Skeleton state -->
      <template v-if="loadingSkelton">
        <div class="flex justify-between items-center animate-pulse">
          <div class="flex flex-col gap-2 w-1/2">
            <div class="h-5 bg-gray-700 rounded w-3/4"></div>
            <div class="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div class="h-10 w-24 bg-gray-700 rounded"></div>
        </div>
      </template>

      <!-- Real content -->
      <template v-else>
        <div class="flex justify-between items-center">
          <div class="flex flex-col gap-2">
            <h2 class="text-base font-medium">
              {{ isOpen ? 'Tutup Kasir' : 'Ayo Buka Kasir' }}
            </h2>
            <p class="text-sm text-gray-400">{{ currentDateTime }}</p>
          </div>

          <div>
            <RouterLink
              v-if="isOpen"
              to="/close-cashier">
              <Button variant="outline" size="sm" class="px-4 py-5 text-black">
                Tutup Kasir
              </Button>
            </RouterLink>

            <RouterLink
              v-else
              to="/open-cashier">
              <Button variant="outline" size="sm" class="px-4 py-5 text-black">
                Buka Kasir
              </Button>
            </RouterLink>
          </div>
        </div>
      </template>
    </CardContent>
  </Card>
       <Card class="w-full shadow-md mt-5 rounded-2xl">
        <CardContent class="px-5 flex flex-col gap-4">
          <div class="flex justify-between items-center">
            <h2 class="text-md font-medium text-gray-800">Keuntungan</h2>
          </div>

          <div class="flex">
            <div>
              <div class="flex items-start">
                <span class="text-lg text-gray-800 font-semibold">Rp</span>
                <span v-if="loading" class="ml-1 h-8 w-32 bg-gray-200 rounded animate-pulse"></span>
                <span v-else class="text-3xl font-bold">{{ profitToday.toLocaleString() }}</span>
              </div>
              <p class="text-sm text-gray-500 mt-4">
                Keuntunganmu
                <span :class="difference < 0 ? 'text-red-500' : 'text-green-800'">
                  {{ difference < 0 ? 'kurang' : 'bertambah' }}
                </span>
                hari ini sebesar
                <span class="font-medium" :class="difference < 0 ? 'text-red-500' : 'text-green-800'">
                  Rp{{ Math.abs(difference).toLocaleString() }}
                </span>
                dari hari kemarin
              </p>
            </div>

            <div class="flex items-end gap-3 mt-2">
              <div
                v-for="m in months"
                :key="m.name"
                class="flex flex-col items-center gap-1"
              >
                <div
                  class="w-5 rounded-md transition-all duration-300"
                  :class="[
                    m.active
                      ? (isIncrease ? 'bg-green-800' : 'bg-red-500')
                      : 'bg-gray-300'
                  ]"
                  :style="{ height: (m.value / maxValue) * 60 + 'px' }"
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
      <RecentTrx class="mt-5 mb-20" />  
      <BottomNav />
    </div>
</template>