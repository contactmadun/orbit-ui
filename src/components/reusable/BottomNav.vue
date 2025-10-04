<script setup>
import { Home, Wallet, BarChart2, Settings, Scan } from 'lucide-vue-next'
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

// const goTransaction = () => {
//   router.push('/transaction')
// }

const handleSelect = (menu) => {
  if (menu.path && route.path !== menu.path) {
    router.push(menu.path)
  }
}

</script>

<!-- <template>
  <nav class="fixed bottom-0 left-0 right-0 z-40">
    <div class="relative h-20">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        class="absolute bottom-0 left-0 w-full h-20 text-white"
      >
        <path
          d="M0,0 L0,100 L100,100 L100,0 Q50,60 0,0"
          fill="white"
        />
      </svg>

      <div class="absolute bottom-0 left-0 right-0 flex justify-around items-center pb-2">
        <div
          v-for="menu in menus.slice(0,2)"
          :key="menu.key"
          class="flex flex-col items-center cursor-pointer"
          :class="route.path === menu.path ? 'text-black' : 'text-gray-400'"
          @click="handleSelect(menu)"
        >
          <component :is="menu.icon" class="w-5 h-5 mb-1" />
          <span class="text-xs">{{ menu.name }}</span>
        </div>


        <div class="w-16"></div>

        <div
          v-for="menu in menus.slice(2)"
          :key="menu.key"
          class="flex flex-col items-center cursor-pointer"
          :class="route.path === menu.path ? 'text-black' : 'text-gray-400'"
          @click="handleSelect(menu)"
        >
          <component :is="menu.icon" class="w-5 h-5 mb-1" />
          <span class="text-xs">{{ menu.name }}</span>
        </div>
      </div>

      <div
        class="absolute left-1/2 transform -translate-x-1/2 bg-black p-4 rounded-full shadow-lg cursor-pointer"
        @click="goTransaction"
      >
        <Scan class="w-6 h-6 text-white" />
      </div>
    </div>
  </nav>
</template> -->

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
