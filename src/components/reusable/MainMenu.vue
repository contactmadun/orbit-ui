<script setup>
import { ShoppingCart, Wallet, Package, MoreHorizontal } from 'lucide-vue-next'

// daftar menu, bisa dipakai untuk loop
const menus = [
  { name: 'Penjualan', icon: ShoppingCart, key: 'penjualan' },
  { name: 'Keuangan', icon: Wallet, key: 'keuangan' },
  { name: 'Produk', icon: Package, key: 'produk' },
  { name: 'Lainnya', icon: MoreHorizontal, key: 'lainnya' },
]

const emit = defineEmits(['select'])

const handleSelect = (menu) => {
  emit('select', menu.key)
}
</script>

<template>
  <div class="grid grid-cols-4 gap-3 w-full">
    <div
      v-for="menu in menus"
      :key="menu.key"
      class="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
      @click="handleSelect(menu)"
    >
      <component :is="menu.icon" class="w-6 h-6 text-gray-700 mb-1" />
      <span class="text-xs font-medium text-gray-700 text-center">
        {{ menu.name }}
      </span>
    </div>
  </div>
</template>
