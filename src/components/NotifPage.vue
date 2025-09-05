<script setup>
import api from '../axios'
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue'

const route = useRoute()

const type = route.query.type
const token = route.query.token

const message = ref("")

onMounted(async () => {
    if(type === 'activation' && token){
        try {
            const res = await api.post(`users/activate/${token}`)
            message.value = res.data.message || "Aktivasi"
        } catch (error) {
            
        }
    }
})

// const title = computed (() => {
//     if (type === 'reset') return 'Reset Password '
//     if (type === 'activation') return 'Aktivasi Akun '
//     return message || ' '
// })

</script>

<template>
    <div class="flex items-center justify-center pt-10">
        <div class="flex flex-col items-center gap-2 text-center p-2">
            <h1 class="text-2xl font-medium lg:text-base">{{ message }}Berhasil 🎉</h1>   
            <p class="text-muted-foreground text-sm">Akunmu telah aktif. Silahkan masuk <br> pada aplikasi pada <router-link to="/login" class="underline underline-offset-4">tautan ini</router-link></p>         
        </div>
    </div>
</template>