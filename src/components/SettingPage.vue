<script setup>
import { useRouter } from 'vue-router'
import BottomNav from './reusable/BottomNav.vue'
import { ref } from 'vue'
import api from '../axios'

const loading = ref(false)
const router = useRouter()

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
    <div class="flex items-center justify-center h-screen">
       <button @click="handleLogout" class="underline mt-80" :disabled="loading">{{ loading ? "Proses logout..." : "logout" }}</button>
    </div>
    <BottomNav />
</template>