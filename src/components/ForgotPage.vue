<script setup>
// import Label from './ui/label/Label.vue'
import Input from './ui/input/Input.vue'
import Button from './ui/button/Button.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import api from '../axios'

const router = useRouter();

const email = ref("")
const msg = ref("")
const emailError = ref("");

const handleReset = async () => {
    try {
        const res = await api.post("users/reset-password", {
            email: email.value
        });
        msg.value = res.data.message

        router.push({
            path: '/login',
            query: { msg: msg.value }
        })
    } catch (error) {
        console.log(error);
        if (error.response?.data?.message === "Email tidak ditemukan"){
            emailError.value = error.response.data.message
        }
    }
}
</script>

<template>
    <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-10 px-5">
        <h1 class="text-4xl font-medium lg:text-base">Lupa</h1>
        <h1 class="text-4xl font-medium lg:text-base mb-3">Kata Sandi</h1>
        <p class="text-muted-foreground text-sm">Masukan email kamu yang terdaftar sebelumnya di aplikasi. Lalu cek email pada bagian kotak masuk atau spam untuk mendapatkan link reset password.</p>
    </div>
    <div class="flex flex-col gap-2 items-start lg:justify-center px-5">
        <form @submit.prevent="handleReset" class="w-full">
            <div class="grid gap-6">
                <div class="grid gap-2">
                    <Input id="email" v-model="email" type="email" placeholder="emailkamu@mail.com" class="w-full" required></Input>
                    <p v-if="emailError" class="text-red-500 text-sm">{{ emailError }}</p>
                </div>
                <Button type="submit" class="w-full">Reset</Button>
            </div>
        </form>
    </div>
</template>