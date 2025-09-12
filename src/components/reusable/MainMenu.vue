<script setup>
import { ShoppingCart, Wallet, Package, MoreHorizontal } from 'lucide-vue-next'

// daftar menu, bisa dipakai untuk loop
const menus = [
  { name: 'Penjualan', icon: ShoppingCart, key: 'penjualan', route: '/transaction' },
  { name: 'Keuangan', icon: Wallet, key: 'keuangan', route: '/report' },
  { name: 'Produk', icon: Package, key: 'produk', route: '/product' },
  { name: 'Lainnya', icon: MoreHorizontal, key: 'lainnya', route: '/other' },
]

const emit = defineEmits(['select'])

const handleSelect = (menu) => {
  emit('select', menu.key)
}
</script>

<template>
  <div class="grid grid-cols-4 gap-3 w-full">
    <RouterLink
      v-for="menu in menus"
      :to="menu.route"
      :key="menu.key"
      class="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
      @click="handleSelect(menu)"
    >
      <component :is="menu.icon" class="w-6 h-6 text-black mb-1" />
      <span class="text-xs text-center">
        {{ menu.name }}
      </span>
    </RouterLink>
  </div>
</template>
