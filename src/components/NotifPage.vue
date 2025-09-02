<script setup>
// import Label from './ui/label/Label.vue'
// import Input from './ui/input/Input.vue'
// import Button from './ui/button/Button.vue'
import { useRoute } from 'vue-router';
import { computed } from 'vue'

const route = useRoute()

const type = route.query.type
const message = route.query.message

const title = computed (() => {
    if (type === 'reset') return 'Reset Password '
    if (type === 'activation') return 'Aktivasi Akun '
    return message || ' '
})

</script>

<template>
    <div class="flex items-center justify-center pt-10">
        <div class="flex flex-col items-center gap-2 text-center p-2">
            <h1 class="text-2xl font-medium lg:text-base">{{ title }}Berhasil</h1>   
            <p class="text-muted-foreground text-sm">Akunmu telah aktif. Silahkan masuk <br> pada aplikasi pada <router-link to="/" class="underline underline-offset-4">tautan ini</router-link></p>         
        </div>
    </div>
</template>