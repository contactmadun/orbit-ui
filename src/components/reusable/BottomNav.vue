<script setup>
import { Home, Wallet, BarChart2, Settings } from 'lucide-vue-next'
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
// const activeTab = ref('home')

const menus = [
  { name: 'Home', icon: Home, key: 'home', path: '/' },
  { name: 'Cashier', icon: Wallet, key: 'wallet', path: '/cashier' },
  { name: 'Analytics', icon: BarChart2, key: 'analytics' },
  { name: 'Setting', icon: Settings, key: 'setting', path: '/setting' },
]

const handleSelect = (menu) => {
  if (menu.path && route.path !== menu.path) {
    router.push(menu.path)
  }
}

</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md px-6 py-2 flex justify-between items-center"
  >
    <div
      v-for="menu in menus"
      :key="menu.key"
      class="flex flex-col items-center cursor-pointer transition-all"
      :class="route.path === menu.path ? 'text-black' : 'text-gray-400'"
      @click="handleSelect(menu)"
    >
      <component
        :is="menu.icon"
        class="w-5 h-5 mb-1"
        :class="route.path === menu.path ? 'fill-black' : ''"
      />
      <span class="text-xs">{{ menu.name }}</span>
    </div>
  </nav>
</template>
