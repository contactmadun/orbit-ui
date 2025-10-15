<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../axios'
import BottomNav from './reusable/BottomNav.vue'
import MenuCashier from './reusable/MenuCashier.vue'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
const balances = ref([])
const loading = ref(true)
const cashierSessionId = ref(null)

const storeId = userStore.storeId

// 🧮 Hitung total saldo
const totalCurrentBalance = computed(() =>
  balances.value.reduce((sum, item) => sum + (item.currentBalance || 0), 0)
)
const totalOpeningBalance = computed(() =>
  balances.value.reduce((sum, item) => sum + (item.openingBalance || 0), 0)
)

// 🔹 Ambil session kasir aktif
const fetchCashierSession = async () => {
  try {
    const { data } = await api.get(`/cashier/session/${storeId}`, {
      headers: { Authorization: `Bearer ${userStore.token}` },
    })
    cashierSessionId.value = data?.id || null
    console.log('Cashier session aktif:', cashierSessionId.value)

    if (cashierSessionId.value) {
      await fetchBalances()
    }
  } catch (err) {
    console.error('Gagal fetch cashier session:', err)
  } finally {
    loading.value = false
  }
}

// 🔹 Ambil fund balances
const fetchBalances = async () => {
  try {
    const { data } = await api.get(`/fund/${storeId}/${cashierSessionId.value}`, {
      headers: { Authorization: `Bearer ${userStore.token}` },
    })
    if (data.success) {
      balances.value = data.data
      console.log('Balances:', balances.value)
    }
  } catch (err) {
    console.error('Gagal ambil data fund balance:', err)
  }
}

onMounted(() => {
  fetchCashierSession()
})
</script>

<template>
  <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-10 px-5">
    <MenuCashier />

    <div v-if="loading" class="text-gray-500 mt-5">Memuat data...</div>

    <!-- 🧾 Card Total Saldo -->
    <div
      v-else
      class="w-full bg-gradient-to-r from-slate-900 to-gray-700 text-white rounded-2xl shadow-md p-5 mt-6 mb-2"
    >
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-sm text-gray-300">Total Saldo Sekarang</h2>
          <h1 class="text-2xl font-bold">
            Rp{{ totalCurrentBalance.toLocaleString('id-ID') }}
          </h1>
        </div>
        <div class="text-right">
          <h2 class="text-sm text-gray-300">Total Saldo Pembukaan</h2>
          <h1 class="text-xl font-semibold">
            Rp{{ totalOpeningBalance.toLocaleString('id-ID') }}
          </h1>
        </div>
      </div>
    </div>

    <!-- 🧩 List per sumber dana -->
    <div
      v-if="balances.length"
      class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-2 mb-10"
    >
      <div
        v-for="item in balances"
        :key="item.id"
        class="flex flex-col bg-white border rounded-xl shadow-sm p-5 w-full"
      >
        <div class="flex justify-between items-start mb-1">
          <h3 class="text-sm font-medium text-gray-600">{{ item.title }}</h3>
          <button class="text-gray-400 hover:text-gray-600">...</button>
        </div>

        <div class="flex justify-between items-end">
          <h1 class="text-2xl font-semibold text-gray-900">
            Rp{{ item.currentBalance.toLocaleString('id-ID') }}
          </h1>
        </div>

        <p class="text-xs text-gray-500 mt-1">
          Saldo Pembukaan: Rp{{ item.openingBalance.toLocaleString('id-ID') }}
        </p>
      </div>
    </div>

    <div v-else class="text-gray-500 mt-5">Tidak ada data saldo untuk sesi ini</div>
  </div>

  <BottomNav />
</template>
