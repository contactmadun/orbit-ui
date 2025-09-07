<script setup>
const props = defineProps({
  totalTransactions: { type: Number, default: 0 },
  totalProducts: { type: Number, default: 0 },
  bestProduct: { type: String, default: '-' }
})
</script>

<template>
  <section class="w-full bg-white">
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-xl font-semibold">Laporan Transaksi Hari Ini</h2>
      <!-- <button class="text-sm text-blue-600 hover:underline">See all</button> -->
    </div>
    <!-- Row 1: 2 kolom + divider vertikal + divider bawah -->
    <div class="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200 text-left">
      <div class="flex flex-col items-start py-4 px-4">
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
    <div class="px-4 py-4">
      <span class="text-sm text-gray-500 block mb-1">Produk terlaris</span>
      <p class="text-base font-semibold text-gray-800">
        {{ bestProduct }}
      </p>
    </div>
  </section>
</template>
