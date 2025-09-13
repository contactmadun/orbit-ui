<script setup>
import { ArrowUpRight, ArrowDownRight } from 'lucide-vue-next'

// Data dummy (bisa diganti dari API/backend)
const transactions = [
  { id: 'TXN-001', time: '14:32', desc: 'Coffee, Pastry', amount: 45900 },
  { id: 'TXN-002', time: '14:15', desc: 'Lunch Combo, Drink', amount: 129500 },
  { id: 'TXN-003', time: '13:58', desc: 'Sandwich', amount: 22750 },
  { id: 'TXN-002', time: '14:15', desc: 'Lunch Combo, Drink', amount: 129500 },
  { id: 'TXN-003', time: '13:58', desc: 'Sandwich', amount: 22750 },
]
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
