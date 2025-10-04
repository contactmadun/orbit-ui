<script setup>
import api from '../axios'
import { Check, ChevronsUpDown, Search } from "lucide-vue-next"
import { ref, onMounted } from 'vue'
import TopNavbar from './reusable/TopNavbar.vue'
import Label from './ui/label/Label.vue'
import Input from './ui/input/Input.vue'
import Button from './ui/button/Button.vue'
import { useCurrencyInput } from "@/composable/useCurrencyInput"
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxAnchor,
  ComboboxTrigger
} from "@/components/ui/combobox"
import { Textarea } from "@/components/ui/textarea"
import { useUserStore } from "@/stores/user"

const userStore = useUserStore()

// states
const funds = ref([]) // isi dari sumber dana
const selectedFund = ref(null)
const nominal = useCurrencyInput()
const note = ref("")
const activeSession = ref(null)

async function getActiveSession() {
  try {
    const res = await api.get(`/cashier/session/${userStore.storeId}`)
    activeSession.value = res.data // simpan session aktif
  } catch (err) {
    console.error("Error getActiveSession:", err)
  }
}

async function getFund() {
  try {
    const res = await api.get(`/fund/${userStore.storeId}`)
      funds.value = res.data.map(f => ({label: f.name, value: f.id}))
  } catch (err) {
    console.error("Error getDefaultFund:", err)
  }
}

// handle submit
const topupFund = async () => {
  try {
    if (!activeSession.value) {
      alert("Tidak ada session aktif")
      return
    }
    if (!selectedFund.value) {
      alert("Pilih sumber dana terlebih dahulu")
      return
    }

    // bersihkan input (remove thousand separators, currency symbols)
    // const cleaned = String(nominal.value).replace(/[^0-9.-]+/g, '');
    const amount = nominal.parse();
    if (isNaN(amount) || amount <= 0) {
      alert("Nominal tidak valid")
      return
    }

    const payload = {
      storeId: userStore.storeId,
      cashier_session_id: activeSession.value.id,
      fund_source_id: selectedFund.value.value,
      nominal: amount,
      note: note.value || ''
    }

    const { data } = await api.post("/fund/topup", payload, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })

    alert("Saldo berhasil ditambahkan")
    // reset form
    nominal.value = ""
    note.value = ""
    selectedFund.value = null
    // (opsional) refresh balances/UI
  } catch (err) {
    console.error("Error topupFund:", err)
    alert(err.response?.data?.message || "Terjadi kesalahan saat menambah saldo")
  }
}

onMounted(() => {
getFund()
getActiveSession()
})

</script>

<template>
  <TopNavbar title="Tambah Saldo"/>
  <form @submit.prevent="topupFund" class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-5 px-5 w-full">
    <div class="w-full">
      <div class="grid gap-2 w-full">
        <Label for="nominalTopup" class="block text-left text-gray-500">Jumlah Saldo</Label>
        <Input id="nominalTopup" v-model="nominal.model" placeholder="Jumlah Saldo" type="tel" class="w-full text-sm" required />
      </div>
      <!-- Nama Produk -->
      <div class="flex flex-col items-start py-4">
               <Label class="block text-left text-gray-500 mb-2">Tujuan Sumber Dana</Label>
               <Combobox v-model="selectedFund" by="value">
                 <ComboboxAnchor as-child>
                   <ComboboxTrigger as-child>
                     <Button variant="outline" class="w-[350px] justify-between text-gray-500 font-normal">
                       {{ selectedFund?.label ?? 'Pilih Sumber Dana' }}
                       <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                     </Button>
                   </ComboboxTrigger>
                 </ComboboxAnchor>
     
                 <ComboboxList class="w-[350px]">
                   <div class="relative w-full max-w-sm items-center">
                     <ComboboxInput class="pl-1 focus-visible:ring-0 border-0 border-b rounded-none h-10" placeholder="Cari Sumber Danaa" />
                     <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                       <Search class="size-4 text-muted-foreground" />
                     </span>
                   </div>
                   <ComboboxEmpty>Sumber Dana tidak ditemukan.</ComboboxEmpty>
                   <ComboboxGroup>
                     <ComboboxItem
                       v-for="fund in funds"
                       :key="fund.value"
                       :value="fund"
                     >
                       {{ fund.label }}
                       <ComboboxItemIndicator>
                         <Check class="ml-auto h-4 w-4" />
                       </ComboboxItemIndicator>
                     </ComboboxItem>
                   </ComboboxGroup>
                 </ComboboxList>
               </Combobox>
         </div>
      <!-- Deskripsi -->
      <div class="grid w-full gap-1.5">
        <Label for="note" class="text-gray-500">Catatan</Label>
        <Textarea id="note" v-model="note" placeholder="Catatan" class="text-sm" />
      </div>
    </div>
    <!-- Submit Button -->
    <div class="w-full mt-6">
      <Button type="submit" class="w-full text-white">Simpan Data</Button>
    </div>
  </form>
</template>
