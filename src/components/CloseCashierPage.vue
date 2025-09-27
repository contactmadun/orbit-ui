<script setup>
// import Label from './ui/label/Label.vue'
import { Card, CardContent } from './ui/card'
import Input from './ui/input/Input.vue'
import Button from './ui/button/Button.vue'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import api from '../axios'
import TopNavbar from './reusable/TopNavbar.vue'
import { Plus, Wallet } from 'lucide-vue-next'
import { useUserStore  } from '@/stores'

const userStore = useUserStore()
const router = useRouter();

const fundSources = ref([])
const totalVariance = ref(0)
const cashierSessionId = ref(null)

const fetchFundSources = async () => {
  if (!userStore.storeId) {
    console.error("StoreId tidak ditemukan, pastikan user sudah login")
    return
  }
  try {
    const { data } = await api.get(`fund/${userStore.storeId}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    // format ulang sesuai kebutuhan UI
    fundSources.value = data.map(fund => ({
      id: fund.id,
      label: fund.name,
      value: '' // nominal default kosong
    }))
  } catch (err) {
    console.error("Gagal fetch fund sources:", err)
  }
}

const fetchActiveSession = async () => {
  try {
    const { data } = await api.get(`/cashier/session/${userStore.storeId}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    cashierSessionId.value = data?.id || null
    console.log(cashierSessionId);
  } catch (err) {
    console.error("Gagal fetch cashier session:", err)
  }
}

onMounted(() => {
  fetchFundSources()
  fetchActiveSession()
})

const closeCashier = async () => {
  if (!cashierSessionId.value) {
    console.error("Session tidak ditemukan")
    return
  }

  try {
    const fundsPayload = fundSources.value.map(f => ({
      fundSourceId: f.id,
      amount: parseFloat(f.value) || 0
    }))

    const { data } = await api.post("cashier/close", {
      cashierSessionId: cashierSessionId.value,
      funds: fundsPayload
    }, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })

    totalVariance.value = data.totalVariance
  } catch (err) {
    console.error("Gagal tutup kasir:", err)
  }
}

//Validasi Tombol
const canOpenCashier = computed(() => {
  return fundSources.value.some(src => src.value && parseFloat(src.value) > 0)
})

</script>

<template>
    <TopNavbar title="Tutup Kasir" />
    <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-5 px-5">
        <Card class="w-full shadow-xs mt-5 rounded-2xl">
        <CardContent class="px-5 flex flex-col gap-3">
          <!-- Header -->
          <div class="flex justify-between items-center">
            <div class="flex flex-col gap-2 w-full">
                <div class="flex gap-2 items-center mb-2">
                    <Wallet class="w-5 h-5" ></Wallet>
                    <h2 class="text-lg font-medium">Sumber Dana</h2>
                </div>
                <!-- Kondisi jika ada sumber dana -->
                <div>
                  <div v-for="(src, index) in fundSources" :key="src.id" class="space-y-2 w-full">
                      <label class="text-sm font-medium">{{ src.label }}</label>
                      <Input
                      class="mt-2 mb-2 text-sm"
                      type="number"
                      placeholder="Masukan Nominal"
                      v-model="src.value"
                      />
                  </div>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
        <Card class="w-full shadow-md mt-5 rounded-lg">
        <CardContent class="px-3 flex flex-col gap-3">
            <Button
                class="w-full"
                :disabled="!canOpenCashier"
                @click="closeCashier">
                Tutup Kasir
            </Button>
        </CardContent>
      </Card>
        <Card class="w-full shadow-xs mt-5 rounded-2xl">
        <CardContent class="px-5 flex flex-col gap-3">
          <!-- Header -->
          <div class="flex justify-between items-center">
            <div class="flex flex-col gap-2 w-full">
                <div class="flex gap-2 items-center mb-2">
                    <Wallet class="w-5 h-5" ></Wallet>
                    <h2 class="text-lg font-medium">Selisih</h2>
                </div>
                <!-- Kondisi jika ada sumber dana -->
                <div>
                  <div class="space-y-2 w-full">
                      <label class="text-sm font-medium">Selisih</label>
                      <Input disabled
                      class="mt-2 mb-2 text-sm"
                      type="number"
                      v-model="totalVariance"
                      />
                  </div>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card class="w-full shadow-md mt-5 rounded-lg">
        <CardContent class="px-3 flex flex-col gap-3">
            <RouterLink to="/">
              <Button
                class="w-full">
                Beranda
              </Button>
            </RouterLink>
        </CardContent>
      </Card>
    </div>
</template>