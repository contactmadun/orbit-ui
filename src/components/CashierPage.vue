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

</script>

<template>
    <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-10 px-5">
    <h2>Halo</h2>
    </div>
</template>