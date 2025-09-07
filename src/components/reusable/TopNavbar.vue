<script setup>
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  title: { type: String, default: '' }
})

const goBack = () => {
  router.back()
}
</script>

<template>
  <header class="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
    <!-- Tombol Back -->
    <button
      @click="goBack"
      class="p-2 rounded-full hover:bg-gray-100 transition"
      aria-label="Back"
    >
      <ArrowLeft class="w-5 h-5 text-gray-700" />
    </button>

    <!-- Judul -->
    <h1 class="text-lg font-semibold text-gray-800">
      Buka Kasir
    </h1>
  </header>
</template>
