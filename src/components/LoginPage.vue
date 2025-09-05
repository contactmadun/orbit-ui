<script setup>
import Label from './ui/label/Label.vue'
import Input from './ui/input/Input.vue'
import Button from './ui/button/Button.vue'
import { Rocket } from 'lucide-vue-next'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import api from '../axios'

const router = useRouter()
const route = useRoute()
const msg = ref("")

const email = ref("")
const password = ref("")

onMounted(() => {
    if(route.query.msg){
        msg.value = route.query.msg
    }

    setTimeout(() => {
        msg.value = ""
    }, 5000)
})

const handleLogin = async () => {
    try {
        const res = await api.post("users/login", {
            email: email.value,
            password: password.value
        })

        localStorage.setItem("token", res.data.token)
        router.push("/")
    } catch (error) {
        console.error(err.response?.data || err.message)
        // msg.value = err.response?.data?.message || "Login gagal"
    }
}
</script>

<template>
    <div class="flex items-center justify-center h-screen">
        <div class="flex flex-col items-center gap-2 text-center p-2">
            <Transition
            enter-active-class="transition transform duration-700 ease-out"
            enter-from-class="opacity-0 -translate-y-5"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition transform duration-700 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-10">
                <Alert v-if="msg">
                <Rocket class="h-4 w-4"/>
                    <AlertTitle class="text-left">Selamat</AlertTitle>
                    <AlertDescription>
                    {{ msg }}
                    </AlertDescription>
                </Alert>
            </Transition>
            <h1 class="text-2xl font-medium">Masuk akunmu sekarang</h1>
            <p class="text-sm text-balance text-muted-foreground mb-4">Masukan email dan password untuk akses aplikasi</p>

            <form @submit.prevent="handleLogin" class="w-full">
                <div class="grid gap-6">
                    <div class="grid gap-2">
                        <Label for="email" class="block text-left">Email</Label>
                        <Input id="email" v-model="email" type="email" placeholder="email@mail.com" class="w-full" required></Input>
                    </div>
                    <div class="grid gap-2">
                        <div class="flex items-center">
                            <Label for="password">Kata Sandi</Label>
                            <RouterLink to="/forgot-password" class="ml-auto text-sm underline-offset-4 hover:underline">Lupa Kata Sandi?</RouterLink>
                            <!-- <a href="#" class="">Lupa Kata Sandi?</a> -->
                        </div>
                        <Input id="password" v-model="password" type="password" required></Input>
                    </div>  
                    <Button type="submit" class="w-full">Masuk</Button>
                    <div class="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                        <span class="relative z-10 bg-background px-2 text-muted-foreground">Atau masuk dengan</span>
                    </div>
                <Button variant="outline" class="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                    </svg>
                    Login with Google
                </Button>
                <RouterLink to="/register" class="text-center text-sm">Belum punya akun? <span class="underline underline-offset-4">Daftar</span></RouterLink>
                </div>
            </form>
        </div>
    </div>
</template>