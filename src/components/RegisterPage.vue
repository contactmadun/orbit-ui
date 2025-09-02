<script setup>
// import Label from './ui/label/Label.vue'
import Input from './ui/input/Input.vue'
import Button from './ui/button/Button.vue'

</script>

<template>
    <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-10 px-5">
        <h1 class="text-4xl font-medium lg:text-base">Halo</h1>
        <h1 class="text-4xl font-medium lg:text-base mb-3">Selamat Bergabung</h1>
        <p class="text-muted-foreground text-sm">Masukan informasi data diri kamu dibawah ini. Selanjutnya kamu akan mendapatkan link aktivasi akun di email yang didaftarkan. Ayo lengkapi dibawah ini.</p>
    </div>
    <div class="flex flex-col gap-2 items-start lg:justify-center px-5">
        <form @submit.prevent="handleReset" class="w-full">
            <div class="grid gap-6">
                <div class="grid gap-2">
                    <Label for="name" class="block text-left">Nama Lengkap</Label>
                    <Input id="name" type="text" placeholder="Fulan" class="w-full" required></Input>
                </div>
                <div class="grid gap-2">
                    <Label for="outlet" class="block text-left">Nama Outlet</Label>
                    <Input id="outlet" type="text" placeholder="Orbit Cell" class="w-full" required></Input>
                </div>
                <div class="grid gap-2">
                    <Label for="number" class="block text-left">Nomor Whatsapp</Label>
                    <Input id="number" type="number" placeholder="0821xxxx" class="w-full" required></Input>
                </div>
                <div class="grid gap-2">
                    <Label for="email" class="block text-left">Email</Label>
                    <Input id="email" type="email" placeholder="emailkamu@mail.com" class="w-full" required></Input>
                </div>
                <div class="grid gap-2">
                    <Label for="password" class="block text-left">Kata Sandi</Label>
                    <Input id="password" type="password" class="w-full" required></Input>
                </div>
                <Button type="submit" class="w-full">Daftar Sekarang</Button>
                <RouterLink to="/" class="text-center text-sm">Sudah punya akun? <span class="underline underline-offset-4">Masuk</span></RouterLink>
            </div>
        </form>
    </div>
</template>