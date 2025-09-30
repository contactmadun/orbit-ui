<script setup>
import { ArrowUpRight, ArrowDownRight } from 'lucide-vue-next'
import { useUserStore } from '@/stores'
import { ref, onMounted } from 'vue'
import api from '@/axios'

const userStore = useUserStore();
const transactions = ref([])
const cashierSessionId = ref(null)

async function getActiveSession() {
  try {
    const res = await api.get(`/cashier/session/${userStore.storeId}`)
    cashierSessionId.value = res.data?.id // sesuaikan dengan response BE
    if (cashierSessionId.value) {
      fetchLastTransactions()
    }
  } catch (err) {
    console.error("Error getActiveSession:", err)
  }
}

const fetchLastTransactions = async () => {
  try {
    const { data } = await api.get(
      `transaction/${userStore.storeId}/${cashierSessionId.value}/last-transactions`
    )
    transactions.value = data
  } catch (error) {
    console.error("Gagal fetch transaksi terakhir:", error)
  }
}

onMounted(() => {
  getActiveSession()
})

</script>

<template>
  <section class="w-full">
    <!-- Header -->
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-base font-semibold text-gray-800">Transaksi Terakhir</h2>
      <!-- <button class="text-sm text-blue-600 hover:underline">See all</button> -->
    </div>

    <!-- List Transactions -->
    <div class="divide-y divide-gray-100">
      <div
        v-for="tx in transactions"
        :key="tx.id"
        class="flex items-center justify-between py-3"
      >
        <!-- Left Info -->
        <div class="flex flex-col">
          <span class="font-medium text-gray-800">{{ tx.id }} • {{ tx.time }}</span>
          <span class="text-sm text-gray-500">{{ tx.desc }}</span>
        </div>

        <!-- Right Info -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-gray-800">
            Rp{{ tx.amount.toLocaleString('id-ID') }}
          </span>
          <ArrowUpRight class="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  </section>
</template>
