<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/stores/user"
import api from "../axios"
import TopNavbar from "./reusable/TopNavbar.vue"
import Input from "./ui/input/Input.vue"
import Button from "./ui/button/Button.vue"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const router = useRouter()
const userStore = useUserStore()

// STATE
const brands = ref([])
const selectedBrand = ref("")
const products = ref([])
const selectedProduct = ref("")
const loading = ref(false)
const amount = ref("")
const note = ref("")

// --- Fetch brand dari API
const fetchBrands = async () => {
  try {
    const res = await api.get(`/brand?storeId=${userStore.storeId}`)
    brands.value = res.data.map((b) => ({
      label: b.name,
      value: String(b.id),
    }))
  } catch (err) {
    console.error("Gagal ambil brand:", err)
  }
}

// --- Fetch produk berdasarkan brand
const fetchProducts = async () => {
  if (!selectedBrand.value) return
  loading.value = true
  try {
    const res = await api.get(`/products?brandId=${selectedBrand.value}`)
    products.value = res.data.data || []
  } catch (err) {
    console.error("Gagal ambil produk:", err)
  } finally {
    loading.value = false
  }
}

// --- Simpan stok baru
const submitStock = async () => {
  if (!selectedBrand.value || !selectedProduct.value || !amount.value) {
    alert("Lengkapi semua data terlebih dahulu!")
    return
  }

  try {
    await api.post("/stock/add", {
      storeId: userStore.storeId,
      brandId: selectedBrand.value,
      productId: selectedProduct.value,
      amount: Number(amount.value),
      note: note.value,
    })
    alert("Stok berhasil ditambahkan!")
    router.push("/stok-opname") // redirect ke halaman stok opname
  } catch (err) {
    console.error("Gagal menambah stok:", err)
    alert("Terjadi kesalahan saat menambah stok.")
  }
}

onMounted(() => {
  fetchBrands()
})
</script>

<template>
  <TopNavbar title="Tambah Stok" />

  <div class="flex flex-col gap-5 items-start mb-10 pt-5 px-5 w-full max-w-lg mx-auto">
    <h1 class="text-2xl font-bold mb-3">Tambah Stok Produk</h1>

    <!-- Pilih Brand -->
    <div class="flex flex-col gap-2 w-full">
      <label class="text-sm font-semibold text-gray-700">Pilih Brand</label>
      <Select v-model="selectedBrand" @update:modelValue="fetchProducts">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Pilih brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="b in brands" :key="b.value" :value="b.value">
            {{ b.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Pilih Produk -->
    <div class="flex flex-col gap-2 w-full">
      <label class="text-sm font-semibold text-gray-700">Pilih Produk</label>
      <Select v-model="selectedProduct" :disabled="!products.length">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Pilih produk" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="p in products" :key="p.id" :value="String(p.id)">
            {{ p.name }}
          </SelectItem>
        </SelectContent>
      </Select>
      <p v-if="!products.length && selectedBrand" class="text-xs text-gray-500">
        Tidak ada produk untuk brand ini
      </p>
    </div>

    <!-- Jumlah -->
    <div class="flex flex-col gap-2 w-full">
      <label class="text-sm font-semibold text-gray-700">Jumlah Stok Tambahan</label>
      <Input type="number" min="1" v-model="amount" placeholder="Masukkan jumlah stok" />
    </div>

    <!-- Catatan -->
    <div class="flex flex-col gap-2 w-full">
      <label class="text-sm font-semibold text-gray-700">Catatan (Opsional)</label>
      <Input type="text" v-model="note" placeholder="Catatan tambahan (opsional)" />
    </div>

    <!-- Tombol Simpan -->
    <div class="flex justify-end w-full mt-4">
      <Button
        @click="submitStock"
        class="px-6"
        :disabled="loading || !selectedBrand || !selectedProduct || !amount"
      >
        {{ loading ? "Menyimpan..." : "Simpan Stok" }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
/* opsional: style tambahan ringan */
</style>
