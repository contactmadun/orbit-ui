<script setup>
import { useUserStore } from '@/stores'
import { ref, onMounted } from 'vue'
import api from '@/axios'


const userStore = useUserStore();

const totalTransactions = ref(0)
const totalProducts = ref(0)
const bestProduct = ref('-')
const cashierSessionId = ref(null)

async function getActiveSession() {
  try {
    const res = await api.get(`/cashier/session/${userStore.storeId}`)
    cashierSessionId.value = res.data?.id // sesuaikan dengan response BE
    if (cashierSessionId.value) {
      getReport()
    }
  } catch (err) {
    console.error("Error getActiveSession:", err)
  }
}

async function getReport() {
  try {
    const res = await api.get(
      `/transaction/report/${userStore.storeId}/${cashierSessionId.value}`
    )
    totalTransactions.value = res.data.totalTransactions
    totalProducts.value = res.data.totalProducts
    bestProduct.value = res.data.bestProduct
  } catch (err) {
    console.error("Error getReport:", err)
  }
}

onMounted(() => {
  getActiveSession()
})

</script>

<template>
  <section class="w-full bg-white">
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-base font-semibold text-gray-800">Laporan Transaksi Hari Ini</h2>
      <!-- <button class="text-sm text-blue-600 hover:underline">See all</button> -->
    </div>
    <!-- Row 1: 2 kolom + divider vertikal + divider bawah -->
    <div class="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200 text-left">
      <div class="flex flex-col items-start py-4 px-1">
        <span class="text-sm text-gray-500 mb-1">Total transaksi</span>
        <p class="text-base font-semibold text-gray-800">
          {{ totalTransactions.toLocaleString('id-ID') }} transaksi
        </p>
      </div>

      <div class="flex flex-col items-start py-4 px-4">
        <span class="text-sm text-gray-500 mb-1">Total produk terjual</span>
        <p class="text-base font-semibold text-gray-800">
          {{ totalProducts.toLocaleString('id-ID') }} produk
        </p>
      </div>
    </div>

    <!-- Row 2: Produk terlaris (full width) -->
    <div class="px-1 py-4">
      <span class="text-sm text-gray-500 block mb-1">Produk terlaris</span>
      <p class="text-base font-semibold text-gray-800">
        {{ bestProduct }}
      </p>
    </div>
  </section>
</template>
