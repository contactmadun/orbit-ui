<script setup>
import { useRouter } from 'vue-router'
import BottomNav from './reusable/BottomNav.vue'
import { ref, computed, onMounted } from 'vue'
import { LogOut, Printer, ReceiptText, Battery } from 'lucide-vue-next'
import api from '../axios'

const router = useRouter()
const loading = ref(false)
const loadingData = ref(true)

const user = ref({
  name: '',
  email: '',
  imageProfil: '',
  plan: 'Premium plan',
  status: 'Active',
  description: 'Jangan biarkan token mu habis',
  price: 20000,
  seats: 'Repeat order',
  tokenUsed: 0,
  tokenTotal: 0,
})

// 👉 Ambil data user + token dari API
const fetchUserData = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return router.push('/login')

    const res = await api.get('/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('Response backend:', res.data)
    // backend return { user, tokenData }
    const data = res.data

    user.value.name = data.name
    user.value.email = data.email
    user.value.imageProfil = data.avatar
    user.value.tokenTotal = data.totalTokenDays || 0
    user.value.tokenUsed = (data.totalTokenDays || 0) - (data.tokenRemaining || 0)
  } catch (err) {
    console.error(err)
    if (err.response?.status === 401) router.push('/login')
  } finally {
    loadingData.value = false
  }
}

// 🔹 Avatar inisial (jika tidak ada gambar)
const userInitial = computed(() => {
  if (!user.value.name) return ''
  const parts = user.value.name.trim().split(' ')
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
})

// 🔹 Hitung sisa token
const tokenRemaining = computed(() => user.value.tokenTotal - user.value.tokenUsed)
const tokenPercent = computed(() => (tokenRemaining.value / user.value.tokenTotal) * 100 || 0)

const handleLogout = async () => {
  try {
    loading.value = true
    localStorage.removeItem('token')
    router.push('/login')
  } finally {
    loading.value = false
  }
}

onMounted(fetchUserData)
</script>

<template>
  <div class="flex flex-col items-center gap-5 min-h-screen bg-gray-50 pt-10 px-5 pb-24">
    <!-- Loading skeleton -->
    <div v-if="loadingData" class="animate-pulse w-full max-w-md bg-white rounded-2xl shadow p-5">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div class="flex-1">
          <div class="h-3 bg-gray-200 rounded w-3/5 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-2/4"></div>
        </div>
      </div>
      <div class="h-40 bg-gray-100 rounded-lg"></div>
    </div>

    <!-- Profile Card -->
    <div v-else class="w-full max-w-md bg-white rounded-2xl shadow p-5">
      <div class="flex items-center gap-3 mb-4">
        <!-- Avatar -->
        <div v-if="user.imageProfil && user.imageProfil.startsWith('http')">
          <img :src="user.imageProfil" class="w-10 h-10 rounded-full object-cover" />
        </div>
        <div v-else class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
          {{ user.imageProfil || userInitial }}
        </div>
        <div>
          <h2 class="font-semibold text-gray-900">{{ user.name }}</h2>
          <p class="text-sm text-gray-500">{{ user.email }}</p>
        </div>
      </div>

      <div class="border rounded-xl p-4">
        <div class="flex justify-between items-center mb-1">
          <h3 class="font-semibold text-gray-900">{{ user.plan }}</h3>
          <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{{ user.status }}</span>
        </div>
        <p class="text-sm text-gray-500 mb-3">{{ user.description }}</p>

        <div class="flex justify-between items-center">
          <div>
            <p class="text-2xl font-bold text-gray-900">Rp{{ user.price.toLocaleString() }}</p>
            <p class="text-sm text-gray-500">per 30 Token</p>
          </div>
          <div class="w-10 h-10 bg-green-50 flex items-center justify-center rounded-full">
            <Battery class="w-5 h-5 text-green-600" />
          </div>
        </div>

        <!-- Progress token -->
        <div class="mt-4 bg-gray-100 rounded-lg p-3">
          <div class="flex justify-between items-center mb-1">
            <p class="text-sm font-medium text-gray-800">Sisa Token</p>
            <p class="text-sm font-semibold text-gray-800">{{ tokenRemaining }} / {{ user.tokenTotal }}</p>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-green-500 rounded-full transition-all duration-500"
              :style="{ width: tokenPercent + '%' }"
            ></div>
          </div>
        </div>

        <button class="mt-4 w-full border rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          Beli Token
        </button>
      </div>
    </div>

    <!-- Menu List -->
    <div class="w-full max-w-md bg-white rounded-2xl shadow divide-y">
      <button class="flex items-center justify-between w-full px-5 py-4 hover:bg-gray-50">
        <div class="flex items-center gap-3">
          <Printer class="w-5 h-5 text-gray-500" />
          <span class="text-gray-800 font-medium">Printer</span>
        </div>
        <span class="text-gray-400 text-sm">›</span>
      </button>
      <button class="flex items-center justify-between w-full px-5 py-4 hover:bg-gray-50">
        <div class="flex items-center gap-3">
          <ReceiptText class="w-5 h-5 text-gray-500" />
          <span class="text-gray-800 font-medium">Struk</span>
        </div>
        <span class="text-gray-400 text-sm">›</span>
      </button>
      <button
        @click="handleLogout"
        class="flex items-center justify-between w-full px-5 py-4 text-red-600 hover:bg-red-50"
        :disabled="loading"
      >
        <div class="flex items-center gap-3">
          <LogOut class="w-5 h-5" />
          <span class="font-medium">{{ loading ? "Proses logout..." : "Keluar" }}</span>
        </div>
        <span class="text-gray-400 text-sm">›</span>
      </button>
    </div>
  </div>

  <BottomNav />
</template>
