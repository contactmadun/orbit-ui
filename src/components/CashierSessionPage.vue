<script setup>
// import Label from './ui/label/Label.vue'
import { Card, CardContent } from './ui/card'
import Input from './ui/input/Input.vue'
import Button from './ui/button/Button.vue'
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'
import api from '../axios'
import TopNavbar from './reusable/TopNavbar.vue'
import { Plus, Wallet } from 'lucide-vue-next'

const router = useRouter();

const cashRegister = ref('')
const mobileMoney = ref('')
const fundSources = ref([{ id: 1, label: 'Uang Cash', value: '' }, { id: 2, label: 'E-Wallet Dana', value: '' }])

//Validasi Tombol
const canOpenCashier = computed(() => {
  return fundSources.value.some(src => src.value && parseFloat(src.value) > 0)
})

const email = ref("")
const msg = ref("")
const emailError = ref("");

</script>

<template>
    <TopNavbar />
    <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-5 px-5">
        <Card class="w-full max-w-sm shadow-xs mt-5 rounded-2xl">
        <CardContent class="px-5 flex flex-col gap-3">
          <!-- Header -->
          <div class="flex justify-between items-center">
            <div class="flex flex-col gap-2 w-full">
                <div class="flex gap-2 items-center mb-2">
                    <Wallet class="w-5 h-5" ></Wallet>
                    <h2 class="text-lg font-medium">Sumber Dana</h2>
                </div>
                <div v-for="(src, index) in fundSources" :key="src.id" class="space-y-2 w-full">
                    <label class="text-sm font-medium">{{ src.label }}</label>
                    <Input
                    class="mt-2 mb-2 text-sm"
                    type="number"
                    placeholder="Masukan Nominal"
                    v-model="src.value"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    class="flex items-center gap-2 px-3 py-2 border rounded-md w-fit mt-5"
                    @click="addFundSource"
                >
                    <Plus class="w-4 h-4" /> Tambah Sumber
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card class="w-full max-w-sm shadow-md mt-5 rounded-lg">
        <CardContent class="px-3 flex flex-col gap-3">
            <Button
                class="w-full"
                :disabled="!canOpenCashier"
                @click="openCashier">
                Open Cashier
            </Button>
        </CardContent>
      </Card>
    </div>
</template>