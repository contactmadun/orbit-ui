<script setup>
import { ref } from "vue"
import Button from './ui/button/Button.vue'
import { RouterLink } from "vue-router"

const tabs = ["Transaksi Produk", "Transaksi Manual", "Transfer", "Tarik Tunai"]
const activeTab = ref("Transaksi Produk")
</script>

<template>
  <div class="w-full border-b">
    <nav class="flex justify-around">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="activeTab = tab"
        class="relative px-3 py-2 text-sm font-medium text-gray-700"
        :class="activeTab === tab ? 'text-black' : 'text-gray-500'"
      >
        {{ tab }}
        <!-- Underline active -->
        <span
          v-if="activeTab === tab"
          class="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-blue-500 rounded"
        ></span>
      </button>
    </nav>
  </div>

  <!-- Content -->
  <div class="p-4">
    <div v-if="activeTab === 'Transaksi Produk'">
      <div class="flex justify-between">
        <h4>Produk</h4>
        <RouterLink to="/list-product">
          <Button variant="outline">Pilih Produk</Button>
        </RouterLink>
      </div>
    </div>
    <div v-else-if="activeTab === 'Transaksi Manual'">
      <p>Konten Pengeluaran</p>
    </div>
    <div v-else-if="activeTab === 'Transfer'">
      <p>Konten Hutang pelanggan</p>
    </div>
    <div v-else>
      <p>Konten Hutang saya</p>
    </div>
  </div>
</template>
