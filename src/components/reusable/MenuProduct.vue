<script setup>
import { Crown, Tags, FileBox, PackagePlus, PackageSearch } from 'lucide-vue-next'

// daftar menu, bisa dipakai untuk loop
const menus = [
  { name: 'Produk', icon: PackagePlus, key: 'tambah produk', route: '/add-product' },
  { name: 'Stok Opname', icon: PackageSearch, key: 'stok opname', route: '/stocks-opname' },
  { name: 'Tambah Stok', icon: FileBox, key: 'tambah stok', route: '/add-stock' },
  { name: 'Brand', icon: Crown, key: 'tambah brand', route: '/add-brand' },
  { name: 'Kategori', icon: Tags, key: 'tambah kategori', route: '/add-category' },
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
