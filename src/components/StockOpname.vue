<script setup>
import { ref, reactive, computed, onMounted } from "vue"
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

// State
const brands = ref([])
const selectedBrand = ref("")
const products = ref([])
const loading = ref(false)

// per-row states
const physicalStocks = reactive({})   // keyed by product.id
const differences = reactive({})      // keyed by product.id
const editable = reactive({})         // keyed by product.id -> true = input enabled
const adjustMode = reactive({})       // keyed by product.id -> true = currently in adjust/edit mode
const verifiedPer = reactive({})      // keyed by product.id -> true = this row has been verified

// computed: apakah boleh menyimpan (semua baris harus ter-verified)
const canSave = computed(() => {
  if (!products.value.length) return false
  return products.value.every(p => verifiedPer[p.id] === true)
})

// Fetch daftar brand
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

// Fetch produk berdasarkan brand
const fetchProducts = async () => {
  if (!selectedBrand.value) return
  loading.value = true
  try {
    const res = await api.get(`/products?brandId=${selectedBrand.value}`)
    products.value = res.data.data || []

    // reset per-row states
    products.value.forEach(p => {
      physicalStocks[p.id] = 0
      differences[p.id] = 0
      editable[p.id] = true    // awalnya user boleh isi stok fisik
      adjustMode[p.id] = false
      verifiedPer[p.id] = false
    })
  } catch (err) {
    console.error("Error fetching products:", err)
  } finally {
    loading.value = false
  }
}

/**
 * Verifikasi global:
 * - Hitung difference untuk tiap produk
 * - Set verifiedPer[id] = true (artinya current value terverifikasi)
 * - Jika difference === 0 -> lock input (editable=false)
 * - Jika difference !== 0 -> input tetap editable (user bisa adjust)
 * - Reset adjustMode[id] = false (karena verifikasi berarti mode adjust selesai)
 */
const verifyStocks = () => {
  products.value.forEach(p => {
    const physical = Number(physicalStocks[p.id] || 0)
    const system = Number(p.stok)
    const diff = physical - system
    differences[p.id] = diff

    // after verify mark as verified
    verifiedPer[p.id] = true

    // if equal -> lock input; if not equal => keep editable so user can adjust
    editable[p.id] = diff !== 0

    // ensure adjust mode reset after verify
    adjustMode[p.id] = false
  })
}

/**
 * Toggle Adjust per row:
 * - Jika user klik "Adjust" (sebelumnya verified & diff != 0):
 *     -> set adjustMode[id] = true (masuk mode edit), make editable[id] = true
 *     -> set verifiedPer[id] = false (karena user mulai ubah -> harus verifikasi ulang)
 * - Jika user klik "Selesai" (sudah selesai editing):
 *     -> set adjustMode[id] = false, lock input (editable[id] = false)
 *     -> verifiedPer[id] tetap false (user harus klik Verifikasi global lagi)
 *
 * Per-row only: tidak mengubah state baris lain.
 */
const toggleAdjust = (productId) => {
  if (adjustMode[productId]) {
    // selesai edit
    adjustMode[productId] = false
    editable[productId] = false
    // require re-verification for this row
    verifiedPer[productId] = false
  } else {
    // mulai edit (user ingin ubah fisik)
    adjustMode[productId] = true
    editable[productId] = true
    verifiedPer[productId] = false
  }
}

// Kirim hasil opname
const submitStockOpname = async () => {
  if (!canSave.value) {
    alert("Semua item harus terverifikasi terlebih dahulu sebelum menyimpan.")
    return
  }

  const opnameItems = products.value.map((p) => ({
    productId: p.id,
    systemStock: p.stok,
    physicalStock: Number(physicalStocks[p.id] || 0),
    difference: differences[p.id] || 0,
  }))

  try {
    await api.post("/stock-opname", {
      brandId: selectedBrand.value,
      storeId: userStore.storeId,
      items: opnameItems,
      note: "Stock opname otomatis",
    })
    alert("Data stok opname berhasil disimpan!")
    products.value = []
    selectedBrand.value = ""
    // clear per-row states
    Object.keys(physicalStocks).forEach(k => delete physicalStocks[k])
    Object.keys(differences).forEach(k => delete differences[k])
    Object.keys(editable).forEach(k => delete editable[k])
    Object.keys(adjustMode).forEach(k => delete adjustMode[k])
    Object.keys(verifiedPer).forEach(k => delete verifiedPer[k])
  } catch (err) {
    console.error("Gagal menyimpan:", err)
    alert("Gagal menyimpan stok opname.")
  }
}

onMounted(() => {
  fetchBrands()
})
</script>

<template>
  <TopNavbar title="Stok Opname" />

  <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-5 px-5">
    <h1 class="text-2xl font-bold mb-3">Stok Opname</h1>

    <!-- Pilih Brand -->
    <div class="flex flex-col gap-2 w-full max-w-sm">
      <label class="text-sm font-semibold text-gray-700">Pilih Brand</label>

      <Select v-model="selectedBrand">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Pilih brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="b in brands" :key="b.value" :value="b.value">
            {{ b.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        @click="fetchProducts"
        :disabled="!selectedBrand || loading"
        class="mt-2 w-fit"
      >
        {{ loading ? "Memuat..." : "Cari Data" }}
      </Button>
    </div>

    <!-- Tabel Produk -->
    <div v-if="products.length" class="w-full mt-6 overflow-x-auto">
      <table class="min-w-full border border-gray-200 rounded-lg">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left text-sm font-semibold">Nama Produk</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Stok Fisik</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Selisih</th>
            <th class="px-4 py-2 text-left text-sm font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in products"
            :key="product.id"
            class="border-t border-gray-200"
          >
            <td class="px-4 py-2">{{ product.name }}</td>

            <!-- input editable per-row -->
            <td class="px-4 py-2">
              <Input
                type="number"
                min="0"
                class="w-24"
                v-model="physicalStocks[product.id]"
                :disabled="!editable[product.id]"
              />
            </td>

            <td class="px-4 py-2 text-sm">
              <span
                v-if="verifiedPer[product.id]"
                :class="{
                  'text-green-600': differences[product.id] > 0,
                  'text-red-600': differences[product.id] < 0,
                  'text-gray-600': differences[product.id] === 0,
                }"
              >
                {{ differences[product.id] }}
              </span>
              <span v-else class="text-gray-400 italic">-</span>
            </td>

            <td class="px-4 py-2">
              <Button
                variant="secondary"
                size="sm"
                @click="toggleAdjust(product.id)"
                :disabled="!verifiedPer[product.id] || differences[product.id] === 0"
              >
                {{ adjustMode[product.id] ? "Selesai" : "Adjust" }}
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="!loading && selectedBrand" class="text-gray-500 mt-6">
      Tidak ada produk untuk brand ini.
    </div>

    <!-- Tombol Verifikasi & Simpan -->
    <div
      v-if="products.length"
      class="flex flex-col sm:flex-row gap-3 justify-end mt-6 w-full"
    >
      <Button
        variant="outline"
        @click="verifyStocks"
        class="px-6"
      >
        Verifikasi
      </Button>

      <Button @click="submitStockOpname" class="px-6" :disabled="!canSave">
        Simpan
      </Button>
    </div>
  </div>
</template>
