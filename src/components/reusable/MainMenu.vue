<script setup>
import { ref } from 'vue'
import { ShoppingCart, Wallet, Package, MoreHorizontal, Clock, Settings, History } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

// Import shadcn components
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import Button from '@/components/ui/button/Button.vue'

const router = useRouter()
const showOtherSheet = ref(false)

// daftar menu utama
const menus = [
  { name: 'Penjualan', icon: ShoppingCart, key: 'penjualan', route: '/transaction' },
  { name: 'Keuangan', icon: Wallet, key: 'keuangan', route: '/finance' },
  { name: 'Produk', icon: Package, key: 'produk', route: '/product' },
  { name: 'Lainnya', icon: MoreHorizontal, key: 'lainnya' },
]

// daftar menu lainnya (yang muncul di sheet)
const otherMenus = [
  { name: 'Mutasi Keuangan', icon: History, route: '/mutation' },
  { name: 'Riwayat PPOB', icon: Clock, route: '/ppob-history' },
  { name: 'Pengaturan', icon: Settings, route: '/settings' },
]

const handleSelect = (menu) => {
  if (menu.key === 'lainnya') {
    showOtherSheet.value = true
  } else {
    router.push(menu.route)
  }
}
</script>

<template>
  <div class="grid grid-cols-4 gap-3 w-full">
    <!-- Loop menu utama -->
    <div
      v-for="menu in menus"
      :key="menu.key"
      class="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
      @click="handleSelect(menu)"
    >
      <component :is="menu.icon" class="w-6 h-6 text-black mb-1" />
      <span class="text-xs text-center">{{ menu.name }}</span>
    </div>
  </div>

  <!-- Sheet Bottom untuk menu Lainnya -->
  <Sheet v-model:open="showOtherSheet">
    <SheetContent side="bottom" class="rounded-t-2xl p-6">
      <SheetHeader>
        <SheetTitle class="text-center mb-2">Menu Lainnya</SheetTitle>
        <SheetDescription class="text-center text-gray-500 mb-4">
          Pilih menu tambahan di bawah ini
        </SheetDescription>
      </SheetHeader>

      <div class="grid grid-cols-3 gap-4 text-center">
        <div
          v-for="item in otherMenus"
          :key="item.name"
          class="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
          @click="() => { router.push(item.route); showOtherSheet = false }"
        >
          <component :is="item.icon" class="w-6 h-6 text-gray-700 mb-1" />
          <span class="text-xs text-gray-700">{{ item.name }}</span>
        </div>
      </div>

      <div class="mt-6">
        <Button variant="outline" class="w-full" @click="showOtherSheet = false">Tutup</Button>
      </div>
    </SheetContent>
  </Sheet>
</template>
