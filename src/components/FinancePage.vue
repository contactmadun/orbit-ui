<script setup>
// import Label from './ui/label/Label.vue'
import Input from './ui/input/Input.vue'
import Button from './ui/button/Button.vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { ref } from 'vue'
import api from '../axios'
import TopNavbar from './reusable/TopNavbar.vue'
import MenuFinance from './reusable/MenuFinance.vue'


const route = useRoute()
const router = useRouter()

</script>

<template>
    <TopNavbar title="Catatan Keuangan" />
    <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-5 px-5">
    <MenuFinance />
    </div>
</template>