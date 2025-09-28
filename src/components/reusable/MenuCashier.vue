<script setup>
import { ShoppingCart, Wallet, Package, MoreHorizontal } from 'lucide-vue-next'
import api from '@/axios'
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
const session = ref(null)
const loading = ref(false)

// bikin menus sebagai ref agar perubahan .value dipantau oleh Vue
const menus = ref([
  { name: 'Buka Kasir', icon: ShoppingCart, key: 'buka kasir', route: '/open-cashier', disabled: false },
  { name: 'Tutup Kasir', icon: Wallet, key: 'tutup kasir', route: '/close-cashier', disabled: false },
  { name: 'Isi Saldo', icon: Package, key: 'isi saldo', route: '/topup-fund', disabled: false },
  { name: 'Transfer Saldo', icon: MoreHorizontal, key: 'transfer saldo', route: '/transfer-fund', disabled: false },
])

const emit = defineEmits(['select'])

const handleSelect = (menu) => {
  if (!menu.disabled) {
    emit('select', menu.key)
  }
}

const updateMenuState = () => {
  // pastikan menus.value adalah array
  if (!Array.isArray(menus.value)) return

  const buka = menus.value.find(m => m.key === 'buka kasir')
  const tutup = menus.value.find(m => m.key === 'tutup kasir')

  if (!buka || !tutup) return // safety check

  // jika tidak ada session aktif (null) => buka enabled, tutup disabled
  if (!session.value) {
    buka.disabled = false
    tutup.disabled = true
    return
  }

  // jika ada session, lihat statusnya
  if (session.value.status === "open") {
    buka.disabled = true
    tutup.disabled = false
  } else {
    buka.disabled = false
    tutup.disabled = true
  }
}

const fetchSession = async () => {
  // jika storeId belum ada, treat as no active session
  if (!userStore.storeId) {
    session.value = null
    updateMenuState()
    return
  }

  loading.value = true
  try {
    const { data } = await api.get(`/cashier/session/${userStore.storeId}`)
    // data bisa null (tidak ada session aktif)
    session.value = data
  } catch (err) {
    console.error("Gagal fetch cashier session:", err)
    session.value = null
  } finally {
    loading.value = false
    updateMenuState()
  }
}

onMounted(() => {
  fetchSession()
})

// jika storeId berubah (mis. setelah login/fetch user), refetch session
watch(() => userStore.storeId, (val) => {
  if (val) fetchSession()
})
</script>

<template>
  <div class="grid grid-cols-4 gap-3 w-full">
    <template v-for="menu in menus" :key="menu.key">
      <!-- aktif → RouterLink -->
      <RouterLink
        v-if="!menu.disabled"
        :to="menu.route"
        class="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
        @click="handleSelect(menu)"
      >
        <component :is="menu.icon" class="w-6 h-6 text-black mb-1" />
        <span class="text-xs text-center">
          {{ menu.name }}
        </span>
      </RouterLink>

      <!-- disabled → plain div (no navigation) -->
      <div
        v-else
        class="flex flex-col items-center justify-center p-3 rounded-lg opacity-50 cursor-not-allowed transition"
      >
        <component :is="menu.icon" class="w-6 h-6 text-black mb-1" />
        <span class="text-xs text-center">
          {{ menu.name }}
        </span>
      </div>
    </template>
  </div>
</template>
