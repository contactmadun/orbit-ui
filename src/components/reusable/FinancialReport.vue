<script setup>
// Props supaya fleksibel
const props = defineProps({
  sales: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 }
})
</script>

<template>
  <section class="w-full bg-white">
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-base font-semibold text-gray-800">Laporan Keuangan</h2>
      <!-- <button class="text-sm text-blue-600 hover:underline">See all</button> -->
    </div>
    <div class="grid grid-cols-2 divide-x divide-gray-200 text-left">
      <!-- Kolom Penjualan -->
      <div class="flex flex-col items-start py-4 px-4">
        <span class="text-sm text-gray-500 mb-2">Penjualan</span>
        <span class="text-lg font-bold text-gray-800">
          Rp{{ sales.toLocaleString('id-ID') }}
        </span>
      </div>

      <!-- Kolom Pengeluaran -->
      <div class="flex flex-col items-start py-4 px-4">
        <span class="text-sm text-gray-500 mb-2">Pengeluaran</span>
        <span class="text-lg font-bold text-gray-800">
          Rp{{ expenses.toLocaleString('id-ID') }}
        </span>
      </div>
    </div>
  </section>
</template>
