<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { ChevronDown, ChevronUp } from "lucide-vue-next"
import { Card } from "@/components/ui/card"
import TopNavbar from './reusable/TopNavbar.vue'
import { useUserStore } from '@/stores'
import api from "../axios"

const userStore = useUserStore()
const router = useRouter()
const transactionHistory = ref([])
const openIndex = ref(null)
const isLoading = ref(false)
const errorMsg = ref("")

// toggle open card
const toggleOpen = (index) => {
  openIndex.value = openIndex.value === index ? null : index
}

// helper rupiah
const formatRupiah = (num) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })
    .format(num)
    .replace(",00", "")

// Navigasi ke detail transaksi
const goToDetail = (trx) => {
  router.push(`/transaction/${trx.id}`)
}

// Ambil data dari API
const fetchTransactions = async () => {
  try {
    isLoading.value = true
    const storeId = userStore.storeId
    const { data } = await api.get(`/transaction/${storeId}`)
    transactionHistory.value = data
  } catch (err) {
    console.error(err)
    errorMsg.value = "Gagal memuat data transaksi"
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTransactions()
})
</script>

<template>
  <TopNavbar title="Riwayat Transaksi" />
  <div class="min-h-screen bg-gray-50 pb-10">
    <div class="flex flex-col gap-4 items-start pt-5 px-5">
      <div v-if="isLoading" class="w-full flex flex-col gap-3">
        <div v-for="n in 3" :key="n" class="animate-pulse bg-white rounded-xl p-4 shadow-sm">
          <div class="flex justify-between">
            <div class="h-4 bg-gray-200 w-1/3 rounded"></div>
            <div class="h-4 bg-gray-200 w-1/4 rounded"></div>
          </div>
          <div class="mt-3 space-y-2">
            <div class="h-3 bg-gray-100 rounded"></div>
            <div class="h-3 bg-gray-100 w-2/3 rounded"></div>
          </div>
        </div>
      </div>
      <div v-else-if="errorMsg" class="text-center text-red-500 py-10">{{ errorMsg }}</div>

      <div v-else class="w-full flex flex-col gap-3">
        <div
          v-for="(day, index) in transactionHistory"
          :key="index"
          class="bg-white rounded-xl shadow-sm"
        >
          <!-- Header -->
          <button
            @click="toggleOpen(index)"
            class="w-full flex items-center justify-between px-4 py-3 text-left rounded-xl"
          >
            <div class="flex flex-col">
              <span class="font-medium text-gray-800">{{ day.date }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-900">{{ formatRupiah(day.total) }}</span>
              <component
                :is="openIndex === index ? ChevronUp : ChevronDown"
                class="w-4 h-4 text-gray-500"
              />
            </div>
          </button>

          <!-- Detail -->
          <transition name="fade">
            <div v-if="openIndex === index" class="border-t px-3 pb-3">
              <div
                v-for="trx in day.transactions"
                :key="trx.id"
                @click="goToDetail(trx)"
                class="flex justify-between items-start border-b last:border-none py-3 cursor-pointer hover:bg-gray-50 transition"
              >
                <div class="flex flex-col">
                  <span class="font-medium text-gray-800">{{ trx.title }}</span>
                  <span class="text-sm text-gray-500">{{ trx.code }}</span>
                  <span class="text-xs mt-1 text-green-500">{{ trx.status }}</span>
                  <span class="text-xs text-gray-400">{{ trx.product }}</span>
                </div>
                <div class="flex flex-col items-end">
                  <span class="font-semibold text-gray-900">{{ formatRupiah(trx.amount) }}</span>
                  <span class="text-xs text-gray-400">{{ trx.time }}</span>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>
