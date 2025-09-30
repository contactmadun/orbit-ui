<script setup>
import api from '../axios'
import MenuProduct from './reusable/MenuProduct.vue'
import { ref, computed, onMounted } from "vue"
import { Funnel } from "lucide-vue-next"
import { Input } from "@/components/ui/input"
import Button from './ui/button/Button.vue'
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from "@/components/ui/number-field"
import TopNavbar from './reusable/TopNavbar.vue'
import { useRouter } from "vue-router"
import { useUserStore } from "@/stores/user"
import { useCartStore } from "@/stores/cart"

// ⬇️ import shadcn dropdown
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

// Data produk
const products = ref([])
const search = ref("")
const selectedCategory = ref("all")
const selectedType = ref("all") // "all" | "stok" | "inject"
const cart = ref({}) 

// Hitung total pemasukan
const totalPemasukan = computed(() => {
  return Object.entries(cart.value).reduce((sum, [id, qty]) => {
    const product = products.value.find(p => p.id == id)
    if (!product) return sum
    return sum + (product.retailPrice * qty)
  }, 0)
})

// Filter hasil berdasarkan search, kategori & typeProduct
const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.value.toLowerCase())
    const matchCategory = selectedCategory.value === "all" || p.category === selectedCategory.value
    const matchType = selectedType.value === "all" || p.typeProduct === selectedType.value
    return matchSearch && matchCategory && matchType
  })
})

// Fetch data produk dari API
const fetchProducts = async () => {
  try {
    const res = await api.get(`/products?storeId=${userStore.storeId}`)
    products.value = res.data // asumsi API return array produk
  } catch (err) {
    console.error("Gagal ambil produk:", err)
  }
}

function lanjutPencatatan() {
  cartStore.products = products.value
  cartStore.cart = { ...cart.value }
  router.push("/transaction")
}

onMounted(() => {
  fetchProducts()
})

function updateCart(id, val) {
  if (val <= 0) {
    const newCart = { ...cart.value }
    delete newCart[id]
    cart.value = newCart
  } else {
    cart.value = { ...cart.value, [id]: val }
  }
}
</script>

<template>
  <TopNavbar title="Daftar Produk" />
  <div class="flex flex-col gap-3 items-start mb-2 pt-10 px-5">
     <!-- Search + Filter -->
    <div class="w-full flex items-center gap-2">
      <Input 
        v-model="search"
        placeholder="Cari nama produk..." 
        class="flex-1"
      />
      <!-- Dropdown Filter -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">
            <Funnel class="w-4 h-4 mr-1" />
            <span class="text-sm">
              {{ selectedType === "all" ? "Semua" : selectedType }}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Pilih Tipe Produk</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup v-model="selectedType">
            <DropdownMenuRadioItem value="all">Semua</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="stok">Produk Stok</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="inject">Produk Inject</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- List Produk -->
    <div class="w-full flex flex-col divide-y">
      <div 
        v-for="p in filteredProducts" 
        :key="p.id" 
        class="flex justify-between items-center py-3"
      >
        <!-- Info produk -->
        <div class="flex flex-col">
          <span class="font-medium text-gray-900">{{ p.name }}</span>
          <div class="flex items-center gap-2">
            <span class="text-blue-600 font-semibold">
              Rp{{ p.retailPrice.toLocaleString("id-ID") }}
            </span>
          </div>
          <span class="text-sm text-gray-500">
            Modal : Rp{{ p.purchasePrice.toLocaleString("id-ID") }}
          </span>
          <span class="text-xs text-gray-400 italic">
            Tipe: {{ p.typeProduct }}
          </span>
        </div>

        <!-- Tombol -->
        <div>
          <template v-if="p.id in cart">
            <NumberField v-model="cart[p.id]"
              :min="0"
              class="flex items-center"
              @update:modelValue="val => updateCart(p.id, val)">
              <NumberFieldContent>
                <NumberFieldDecrement @click="cart[p.id] <= 1 ? delete cart[p.id] : cart[p.id]--">-</NumberFieldDecrement>
                <NumberFieldInput class="w-24"/>
                <NumberFieldIncrement>+</NumberFieldIncrement>
              </NumberFieldContent>
            </NumberField>
          </template>
          <template v-else>
            <button 
              class="border rounded-md px-4 py-1 text-gray-700 text-sm hover:bg-gray-50"
              @click="updateCart(p.id, 1)">
              Tambah
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Bar -->
  <div
    v-if="totalPemasukan > 0"
    class="fixed bottom-0 left-0 right-0 border-t bg-white p-4 flex justify-between items-center"
  >
    <div class="flex flex-col">
      <span class="text-sm text-gray-600">Total pemasukan</span>
      <span class="font-semibold text-gray-900">
        Rp{{ totalPemasukan.toLocaleString("id-ID") }}
      </span>
    </div>
    <Button class="bg-pink-600 hover:bg-pink-700 text-white" @click="lanjutPencatatan">
      Lanjut pencatatan
    </Button>
  </div>
</template>
