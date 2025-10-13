<script setup>
import { useUserStore } from '@/stores'
import { ref, onMounted } from 'vue'
import api from '@/axios'

const userStore = useUserStore();
const income = ref(0)
const expenses = ref(0)
const loading = ref(true)

const fetchFinanceData = async () => {
  try {
    const storeId = userStore.user?.storeId || userStore.storeId
    const res = await api.get(`/finance/summary-today`, {
      params: { storeId }
    })

    if (res.data && res.data.data) {
      income.value = res.data.data.income
      expenses.value = res.data.data.expenses
    }
  } catch (err) {
    console.error("Gagal mengambil data keuangan:", err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchFinanceData()
})

</script>

<template>
  <section class="w-full bg-white p-4 rounded-lg shadow">
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-base font-semibold text-gray-800">
        Laporan Keuangan Hari Ini
      </h2>
    </div>

    <div v-if="loading" class="text-gray-500 text-sm animate-pulse">
      Memuat data keuangan...
    </div>

    <div v-else class="grid grid-cols-2 divide-x divide-gray-200 text-left">
      <!-- Pemasukan -->
      <div class="flex flex-col items-start py-4 px-2">
        <span class="text-sm text-gray-500 mb-2">Pemasukan</span>
        <span class="text-lg font-bold text-green-700">
          Rp{{ income.toLocaleString('id-ID') }}
        </span>
      </div>

      <!-- Pengeluaran -->
      <div class="flex flex-col items-start py-4 px-4">
        <span class="text-sm text-gray-500 mb-2">Pengeluaran</span>
        <span class="text-lg font-bold text-red-700">
          Rp{{ expenses.toLocaleString('id-ID') }}
        </span>
      </div>
    </div>
  </section>
</template>
