<script setup>
// import Label from './ui/label/Label.vue'
// import Input from './ui/input/Input.vue'
// import Button from './ui/button/Button.vue'
import { Bell } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useUserStore } from '@/stores'

const userStore = useUserStore();

const router = useRouter()
const loading = ref(false)

const handleLogout = async () => {
  try {
    loading.value = true
    // hapus token di localStorage
    localStorage.removeItem("token")
    // redirect ke login
    router.push("/login")
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false
  }
}

</script>

<template>
    <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-10 px-5">
      <div class="flex justify-between items-center w-full">
      <div class="flex flex-col">
        <h1 class="text-xl font-medium">Halo</h1>
        <h6>{{ userStore.user?.name || "Pengguna" }}</h6>
      </div>
      <Bell class="w-5 h-5 cursor-pointer" />
    </div>  
        <button @click="handleLogout" class="underline" :disabled="loading">{{ loading ? "Proses logout..." : "logout" }}</button>
        
    </div>
</template>