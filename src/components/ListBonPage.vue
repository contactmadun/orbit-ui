<script setup>
import api from '../axios'
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import TopNavbar from './reusable/TopNavbar.vue'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { useUserStore } from "@/stores/user"

const userStore = useUserStore()
const router = useRouter()
const funds = ref([]) // isi dari sumber dana
const selectedFund = ref(null)
const cashierSession = ref(null)

// Data dummy list bon
const bonList = ref([])

const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

async function getBonList() {
  try {
    const res = await api.get(`/transaction/bon?storeId=${userStore.storeId}`)
    console.log(res.data.data);
    bonList.value = res.data.data
  } catch (err) {
    console.error("Gagal memuat data bon:", err)
  }
}

const handlePay = async (id) => {
  try {
    if (!selectedFund.value) {
      alert("Pilih sumber dana terlebih dahulu!");
      return;
    }

    const bon = bonList.value.find(b => b.id === id);
    if (!bon) {
      alert("Bon tidak ditemukan!");
      return;
    }

    // console.log(bon.id);
    const payload = {
      trxId: bon.id,
      storeId: userStore.storeId,
      fund_source_id: selectedFund.value.value,
      cashier_session_id: cashierSession.value.id // ambil id fund dari combobox
    };

    // console.log(payload);
    const res = await api.post("/transaction/pay", payload);
    alert(res.data.message || "Pembayaran berhasil!");

    // reload data bon supaya yang sudah lunas hilang dari daftar
    await getBonList();
  } catch (err) {
    console.error("Gagal membayar bon:", err);
    alert(err.response?.data?.message || "Gagal melakukan pembayaran");
  }
};

async function getFund() {
  try {
    const res = await api.get(`/fund/${userStore.storeId}`)
      funds.value = res.data.map(f => ({label: f.name, value: f.id}))
  } catch (err) {
    console.error("Error getDefaultFund:", err)
  }
}

const fetchCashierSession = async () => {
  if (!userStore.storeId) return
  try {
    const { data } = await api.get(`/cashier/session/${userStore.storeId}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    // asumsi backend return session aktif atau null
    cashierSession.value = data
  } catch (err) {
    console.error("Gagal fetch cashier session:", err)
  }
}

onMounted(() => {
getFund()
getBonList()
fetchCashierSession()
})


</script>

<template>
  <TopNavbar title="Daftar Piutang" />
  <div class="pt-7 px-4 flex flex-col gap-3">
    <template v-for="item in bonList" :key="item.id">
      <Card class="rounded-2xl shadow-md border border-gray-200">
        <CardContent class="flex justify-between items-center py-2 px-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <span class="text-gray-600 font-semibold text-lg">
                {{ item.customer_name.charAt(0) }}
              </span>
            </div>
            <div>
              <h2 class="font-semibold text-gray-800 text-base">
                {{ item.customer_name }}
              </h2>
              <p class="text-sm text-gray-500">
                {{ item.product?.name || item.note }}
              </p>
              <h3 class="text-red-500 font-semibold text-base mb-1">
              {{ formatCurrency(item.total) }}
            </h3>
            </div>
          </div>
          <div class="text-right">
            <Dialog>
                <DialogTrigger as-child>
                <Button variant="outline" class="mt-1 text-sm bg-gray-800 text-white py-1 px-3 rounded-md">
                    Bayar
                </Button>
                </DialogTrigger>
                <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Metode Pembayaran</DialogTitle>
                    <DialogDescription>
                    Jika pembayaran uang cash pilih sumber dana laci ya.
                    </DialogDescription>
                </DialogHeader>
                <div class="flex items-center space-x-2">
                    <div class="grid flex-1 gap-2">
                     <Combobox v-model="selectedFund" by="value">
                 <ComboboxAnchor as-child>
                   <ComboboxTrigger as-child>
                     <Button variant="outline" class="w-[300px] justify-between text-gray-500 font-normal">
                       {{ selectedFund?.label ?? 'Pilih Sumber Dana' }}
                       <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                     </Button>
                   </ComboboxTrigger>
                 </ComboboxAnchor>
     
                 <ComboboxList class="w-[300px]">
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
                </div>
                <DialogFooter class="sm:justify-start">
                    <DialogClose as-child>
                    <Button @click="handlePay(item.id)" variant="secondary">
                        Bayar
                    </Button>
                    </DialogClose>
                </DialogFooter>
                </DialogContent>
            </Dialog>
            <!-- <Button
              @click="handlePay(item.id)"
              class="mt-1 text-sm bg-gray-800 text-white py-1 px-3 rounded-md"
            >
              Bayar
            </Button> -->
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>

<style scoped>
/* optional agar tampilan lebih halus */
</style>
