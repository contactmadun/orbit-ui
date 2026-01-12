<script setup>
// import Label from './ui/label/Label.vue'
// import Input from './ui/input/Input.vue'
// import Button from './ui/button/Button.vue'
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
        <h1 class="text-3xl text-gray-800 font-bold lg:text-base">Lupa</h1>
        <h1 class="text-3xl text-gray-800 font-bold lg:text-base mb-3">Kata Sandi</h1>
        <p class="text-gray-400 text-base">Masukan email kamu yang terdaftar sebelumnya di aplikasi. Lalu cek email pada bagian kotak masuk atau spam untuk mendapatkan link reset password.</p>
    </div>
    <div class="flex flex-col gap-2 items-start lg:justify-center px-5">
        <form @submit.prevent="handleReset" class="w-full">
            <div class="grid gap-6">
                <div class="grid gap-2">
                    <input class="block w-full p-3 rounded-xl border border-grey-200 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-200 bg-gray-50" id="email" v-model="email" type="email" placeholder="emailkamu@mail.com" required></input>
                    <p v-if="emailError" class="text-red-500 text-sm">{{ emailError }}</p>
                </div>
                <button type="submit" class="w-full py-2 lg:py-4 bg-blue-700 text-white font-bold text-lg rounded-2xl hover:bg-blue-900 hover:translate-y-0.5 transition-all transform duration-200 shadow-lg">Reset</button>
            </div>
        </form>
    </div>
</template>