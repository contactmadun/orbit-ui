<script setup>
import api from '../axios'
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue'
import TopNavbar from './reusable/TopNavbar.vue'
import Label from './ui/label/Label.vue'
import Input from './ui/input/Input.vue'

const route = useRoute()

</script>

<template>
    <TopNavbar title="Tambah Produk"/>
    <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-5 px-5">
    <div class="w-full">
        <h1 class="font-medium mb-5">Produk Info</h1>
        <div class="grid gap-2 w-full">
            <Label for="name" class="block text-left text-gray-500">Nama Produk</Label>
            <Input id="text" v-model="name" placeholder="Voucher Data Tsel" class="w-full" required></Input>
        </div>
    </div>
    </div>
</template>