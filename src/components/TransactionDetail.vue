<script setup>
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { Clock } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import TopNavbar from "./reusable/TopNavbar.vue"
import api from "@/axios"

const route = useRoute()
const router = useRouter()

const trxDetail = ref(null)
const isLoading = ref(false)
const errorMsg = ref("")
const showDialog = ref(false) // dialog visibility
const vacCode = ref("") // input kode VAC
const vacError = ref("") // pesan error input VAC

const fetchDetail = async () => {
  try {
    isLoading.value = true
    const { id } = route.params
    const { data } = await api.get(`/transaction/detail/${id}`)
    trxDetail.value = data
  } catch (err) {
    console.error(err)
    errorMsg.value = "Gagal memuat detail transaksi"
  } finally {
    isLoading.value = false
  }
}

const handleVoid = () => {
  // buka dialog
  showDialog.value = true
}

const submitVac = async () => {
  if (!vacCode.value) {
    vacError.value = "Kode VAC wajib diisi"
    return
  }
  vacError.value = ""

  try {
    // contoh request ke backend (ubah sesuai kebutuhanmu)
    await api.post(`/transaction/void/${trxDetail.value.id}`, { vac: vacCode.value })
    showDialog.value = false
    router.push("/") // redirect misalnya ke list transaksi
  } catch (err) {
    console.error(err)
    vacError.value = "Kode VAC tidak valid"
  }
}

const formatRupiah = (num) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })
    .format(num || 0)
    .replace(",00", "")

const formatDate = (dateStr) => {
  if (!dateStr) return "-"
  const date = new Date(dateStr)
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

onMounted(fetchDetail)
</script>

<template>
  <TopNavbar title="Detail Transaksi" />
  <div class="max-w-lg w-full bg-white dark:bg-gray-900 p-6 mx-auto">
    <div v-if="isLoading" class="text-center py-10 text-gray-500">
      Memuat data transaksi...
    </div>

    <div v-else-if="errorMsg" class="text-center text-red-500 py-10">
      {{ errorMsg }}
    </div>

    <div v-else-if="trxDetail" class="space-y-6">
      <!-- Header -->
      <div class="flex items-start justify-between border-b pb-4 mb-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ trxDetail.product?.name || trxDetail.note }}
          </h2>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            {{ trxDetail.status || "Sent" }}
          </p>
        </div>
        <h3 class="text-xl font-bold">
          {{ formatRupiah(trxDetail.total) }}
        </h3>
      </div>

      <!-- Detail -->
      <div class="space-y-3 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">Transaction ID</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ trxDetail.trxId }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Transaction Date</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ formatDate(trxDetail.createdAt) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-500">Recipient</span>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {{ trxDetail.customerName?.[0] || "?" }}
              </span>
            </div>
            <span class="font-medium text-gray-900 dark:text-white">{{ trxDetail.customerName || "-" }}</span>
          </div>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Status</span>
          <span class="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
            <Clock class="w-4 h-4" /> {{ trxDetail.status }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Harga Modal</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ formatRupiah(trxDetail.costPrice) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Profit</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ formatRupiah(trxDetail.profit) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">VAC</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ trxDetail.vac }}</span>
        </div>
      </div>

      <!-- Notes -->
      <div class="mt-6">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
        <textarea
          rows="3"
          placeholder="Add a few notes to help you later"
          class="w-full mt-2 border rounded-lg p-3 text-sm text-gray-900 dark:text-white dark:bg-gray-800"
        >{{ trxDetail.note }}</textarea>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-between">
        <button
          class="w-1/2 mr-2 py-2 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Share transaction
        </button>

        <!-- Tombol VOID -->
        <Button
          variant="destructive"
          class="w-1/2 ml-2"
          @click="handleVoid"
        >
          Void
        </Button>
      </div>
    </div>
  </div>

  <!-- Dialog Konfirmasi -->
  <Dialog v-model:open="showDialog">
    <DialogContent class="sm:max-w-[400px]">
        <DialogHeader>
        <DialogTitle class="text-center">Peringatan</DialogTitle>
        <DialogDescription class="text-center text-gray-500">
            Untuk melakukan pembatalan transaksi, silakan masukkan kode VAC Anda.
        </DialogDescription>
        </DialogHeader>

        <div class="py-4 flex flex-col items-center">
        <Input
            v-model="vacCode"
            type="text"
            placeholder="Masukan Kode"
            class="uppercase text-center text-md tracking-widest font-semibold w-3/4"
            @input="vacCode = vacCode.toUpperCase()"
        />
        <p v-if="vacError" class="text-red-500 text-xs mt-2 text-center">{{ vacError }}</p>
        </div>

        <DialogFooter class="flex justify-center gap-3">
        <Button variant="secondary" @click="showDialog = false">Batal</Button>
        <Button variant="default" @click="submitVac">Lanjutkan</Button>
        </DialogFooter>
    </DialogContent>
    </Dialog>
</template>

