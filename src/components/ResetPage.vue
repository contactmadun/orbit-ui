<script setup>
// import Label from './ui/label/Label.vue'
import Input from './ui/input/Input.vue'
import Button from './ui/button/Button.vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { ref } from 'vue'
import api from '../axios'


const route = useRoute()
const router = useRouter()

const showPassword = ref(false)
const showPassword2 = ref(false)
const password = ref("")
const confirmPassword = ref("")
const errorMessage = ref("")

const handleChange = async () => {
    errorMessage.value = ""
  // Validasi sederhana
//   if (!password.value || !confirmPassword.value) {
//     errorMessage.value = "Password tidak boleh kosong"
//     return
//   }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Password dan konfirmasi tidak sama"
    return
  }

  try {
    const token = route.query.token // ambil token dari URL
    const res = await api.post("/users/change-password", {
      token,
      password: password.value
    })

    router.push({
        path: "/notif",
        query: {
            type: "reset",
            message: res.data.message || "Password berhasil dirubah"
        }
    })
  } catch (err) {
    errorMessage.value = err.response?.data?.message || "Terjadi kesalahan"
  }
}
</script>

<template>
    <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-10 px-5">
        <h1 class="text-4xl font-medium lg:text-base">Reset</h1>
        <h1 class="text-4xl font-medium lg:text-base mb-3">Kata Sandi</h1>
        <p class="text-muted-foreground text-sm">Masukan kata sandi kamu yang baru. Rubah kata sandi berbeda dengan yang telah digunakan sebelumnya.</p>
    </div>
    <div class="flex flex-col gap-2 items-start lg:justify-center px-5">
        <form @submit.prevent="handleChange" class="w-full">
            <div class="grid gap-6">
                <div class="grid gap-2">
                    <Label for="password" class="block text-left">Kata Sandi</Label>
                    <div class="relative">
                        <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" class="w-full pr-10" required></Input>
                        <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500" @click="showPassword = !showPassword">
                            <Eye v-if="!showPassword" class="w-5 h-5" />
                            <EyeOff v-else class="w-5 h-5" />
                        </button>
                    </div>
                    <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>
                </div>
                <div class="grid gap-2">
                    <Label for="confirmPassword" class="block text-left">Ulangi Kata Sandi</Label>
                    <div class="relative">
                        <Input id="confirmPassword" v-model="confirmPassword" :type="showPassword2 ? 'text' : 'password'" class="w-full pr-10" required></Input>
                        <button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500" @click="showPassword2 = !showPassword2">
                            <Eye v-if="!showPassword2" class="w-5 h-5" />
                            <EyeOff v-else class="w-5 h-5" />
                        </button>
                    </div>
                    <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>
                </div>
                <Button type="submit" class="w-full">Reset Kata Sandi</Button>
            </div>
        </form>
    </div>
</template>