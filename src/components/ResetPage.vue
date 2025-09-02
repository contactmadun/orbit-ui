<script setup>
// import Label from './ui/label/Label.vue'
import Input from './ui/input/Input.vue'
import Button from './ui/button/Button.vue'

</script>

<template>
    <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-10 px-5">
        <h1 class="text-4xl font-medium lg:text-base">Reset</h1>
        <h1 class="text-4xl font-medium lg:text-base mb-3">Kata Sandi</h1>
        <p class="text-muted-foreground text-sm">Masukan kata sandi kamu yang baru. Rubah kata sandi berbeda dengan yang telah digunakan sebelumnya.</p>
    </div>
    <div class="flex flex-col gap-2 items-start lg:justify-center px-5">
        <form @submit.prevent="handleReset" class="w-full">
            <div class="grid gap-6">
                <div class="grid gap-2">
                    <Label for="password" class="block text-left">Kata Sandi</Label>
                    <Input id="password" type="password" class="w-full" required></Input>
                </div>
                <div class="grid gap-2">
                    <Label for="password-confirm" class="block text-left">Ulangi Kata Sandi</Label>
                    <Input id="password-confirm" type="password" class="w-full" required></Input>
                </div>
                <Button type="submit" class="w-full">Reset Kata Sandi</Button>
            </div>
        </form>
    </div>
</template>