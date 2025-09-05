<script setup>
// import Label from './ui/label/Label.vue'
// import Input from './ui/input/Input.vue'
// import Button from './ui/button/Button.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

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
        <h1>Dashboard</h1>
        <button @click="handleLogout" class="underline" :disabled="loading">{{ loading ? "Proses logout..." : "logout" }}</button>
        
    </div>
</template>