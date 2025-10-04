<script setup> 
import api from '../axios'
import MenuProduct from './reusable/MenuProduct.vue'
import { ref, computed, onMounted } from "vue"
import { ChevronDown } from "lucide-vue-next"
import { Input } from "@/components/ui/input"
import TopNavbar from './reusable/TopNavbar.vue'
import { useUserStore } from "@/stores/user"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const userStore = useUserStore()

const bestProduct = ref("Aksesoris")
const totalSales = ref(4.956) // dalam K (ribuan)
const percentage = ref(25)
const CHART_HEIGHT_PX = 192 // h-48 -> 48 * 4 = 192px


// Data produk
const products = ref([])
const search = ref("")
const selectedCategory = ref("all")
const selectedPeriod = ref("monthly")
// const totalProducts = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)

const totalProductsAll = ref(0)

// Search & filter

// Filter hasil berdasarkan search & kategori
const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.value.toLowerCase())
    const matchCategory = selectedCategory.value === "all" || p.category === selectedCategory.value
    return matchSearch && matchCategory
  })
})

console.log(filteredProducts);


// data kategori produk
const categories = ref([
  { name: "Voucher", value: 150 },
  { name: "Kartu", value: 90 },
  { name: "Aksesoris", value: 300 }, // highlight
  { name: "Pulsa", value: 100 },
  { name: "Data", value: 80 },
  { name: "Lainnya", value: 50 },
])


// normalisasi value agar tidak melebihi tinggi container
const normalized = computed(() => {
  const max = Math.max(...categories.value.map(c => c.value), 1) // prevent div by 0
  return categories.value.map(c => {
    const ratio = c.value / max
    const px = Math.round(ratio * CHART_HEIGHT_PX)
    return { ...c, px }
  })
})

const props = defineProps({
  sales: { type: Number, default: 2500 },
  expenses: { type: Number, default: 360 },
  oos: { type: Number, default: 125 }
})

// Fetch data produk dari API
// ambil produk dengan pagination
const getProducts = async (page = 1) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  try {
    const res = await api.get(`/products?storeId=${userStore.storeId}&page=${page}`)
    products.value = res.data.data   // asumsi API return { data: [...], totalPages: N }
    totalPages.value = res.data.totalPages || 1
    totalProductsAll.value = res.data.totalProducts || 0
  } catch (err) {
    console.error("Gagal ambil produk:", err)
  }
}

onMounted(() => {
  getProducts()
})
</script>

<template>
  <TopNavbar title="Produk" />
  <div class="flex flex-col gap-3 items-start mb-10 pt-10 px-5">
    <!-- Header -->
    <div class="w-full flex justify-between items-center mb-4">
      <h2 class="text-base font-semibold text-gray-800">
        Kategori Produk Terlaris
      </h2>
      <!-- shadcn Select -->
      <Select v-model="selectedPeriod">
        <SelectTrigger class="w-[120px] h-8 text-sm">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Total Sales -->
    <div>
      <p class="text-2xl font-bold text-gray-900 flex items-baseline gap-2">
        Rp{{ totalSales }}K
        <span class="text-green-500 text-sm font-medium">+{{ percentage }}%</span>
      </p>
      <p class="text-sm text-gray-500">
        Great job! You've boosted your estimate by an impressive Rp3,150K compared
        to last month!
      </p>
    </div>

    <!-- Chart kategori -->
    <div class="mt-6 flex items-end gap-4 h-48 w-full">
      <div
        v-for="cat in normalized"
        :key="cat.name"
        class="flex flex-col items-center justify-end flex-1"
      >
        <!-- Bar -->
        <div
          class="w-10 rounded-md transition-all duration-300"
          :class="[
            cat.name === bestProduct
              ? 'bg-blue-500'
              : 'bg-gray-200'
          ]"
          :style="{ height: cat.px + 'px' }"
        ></div>
          
        <!-- Label -->
        <span
          class="text-xs mt-2 text-center"
          :class="cat.name === bestProduct ? 'text-blue-600 font-medium' : 'text-gray-600'"
        >
          {{ cat.name }}
        </span>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-b mt-8 w-full"></div>

    <section class="w-full bg-white">
    <div class="grid grid-cols-2 divide-x divide-gray-200 text-left">
      <!-- Kolom Penjualan -->
      <div class="flex flex-col items-start py-4 px-2">
        <span class="text-sm font-medium text-gray-800 mb-1">Total Produk</span>
        <span class="text-lg font-bold text-gray-800 mb-2">
          {{ totalProductsAll }}
        </span>
        <span class="text-xs text-gray-400">Jumlah keseluruhan produk</span>
      </div>

      <!-- Kolom Pengeluaran -->
      <div class="flex flex-col items-start py-4 px-2">
        <span class="text-sm font-medium text-gray-800 mb-1">Produk Terjual</span>
        <span class="text-lg font-bold text-gray-800 mb-2">
          {{ expenses.toLocaleString('id-ID') }}
        </span>
        <span class="text-xs text-gray-400">Jumlah produk terjual bulan ini</span>
      </div>
    </div>
    <div class="border-b mt-3 w-full"></div>
    <div class="px-2 py-4">
      <span class="text-sm font-medium text-gray-800 block mb-1">Produk Habis Stok</span>
      <p class="text-lg font-bold text-gray-800 mb-2">
        {{ oos.toLocaleString('id-ID') }}
      </p>
      <span class="text-xs text-gray-400">Produk habis stok</span>
    </div>
  </section>
  <h2 class="text-base font-semibold text-gray-800 mt-2">
        Main Menu
  </h2>
  <MenuProduct />
  <h2 class="text-base font-semibold text-gray-800 mt-6">
      Daftar Produk
  </h2>
  <!-- Tabel section -->
   <div class="p-1 w-full">
    <!-- Tabs -->
    <Tabs default-value="all" class="w-full">
      <TabsList class="mb-4">
        <TabsTrigger value="all" @click="selectedCategory = 'all'">Semua Produk</TabsTrigger>
        <TabsTrigger value="Low Stock" @click="selectedCategory = 'Aksesoris'">Low Stock</TabsTrigger>
        <TabsTrigger value="Out of Stock" @click="selectedCategory = 'Kartu'">Out of Stock</TabsTrigger>
      </TabsList>

      <!-- Table Wrapper (scroll-x) -->
      <div class="overflow-x-auto border rounded-lg">
        <table class="min-w-[800px] w-full border-collapse">
          <thead class="text-left text-sm text-gray-600">
            <tr>
              <th colspan="7" class="px-4 py-3">
                <div class="flex flex-wrap gap-3 items-center">
                  <!-- Search -->
                  <input
                    v-model="search"
                    type="text"
                    placeholder="Search product..."
                    class="border rounded-md px-3 py-1 text-sm w-64 focus:ring focus:ring-blue-200"
                  />

                  <!-- Filter Status -->
                  <Select v-model="selectedCategory">
                    <SelectTrigger class="w-[180px]">
                      <SelectValue placeholder="Filter kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="Voucher">Voucher</SelectItem>
                      <SelectItem value="Aksesoris">Aksesoris</SelectItem>
                      <SelectItem value="Kartu">Kartu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </th>
            </tr>
            <tr class="bg-gray-100">
              <th class="px-4 py-2">Nama Produk</th>
              <th class="px-4 py-2">Stok</th>
              <th class="px-4 py-2">Status</th>
              <th class="px-4 py-2">Kategori</th>
              <th class="px-4 py-2">Brand</th>
              <th class="px-4 py-2">Harga</th>
              <th class="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              class="border-b hover:bg-gray-50 text-sm"
            >
              <td class="px-4 py-2 font-medium">{{ product.name }}</td>
              <td class="px-4 py-2">{{ product.stok }}</td>
              <td
                class="px-4 py-2"
                :class="{
                  'text-green-600': product.status === 'Available',
                  'text-red-600': product.status === 'Out of Stock',
                  'text-yellow-600': product.status === 'Low Stock',
                }"
              >
                {{ product.status }}
              </td>
              <td class="px-4 py-2">{{ product.categorie.name }}</td>
              <td class="px-4 py-2">{{ product.brand.name }}</td>
              <td class="px-4 py-2">Rp{{ product.retailPrice.toLocaleString("id-ID") }}</td>
              <td class="px-4 py-2">
                <button class="text-blue-600 hover:underline text-xs">Edit</button>
                <button class="text-red-600 hover:underline text-xs ml-2">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      <Pagination v-slot="{ page }" 
        :total="totalProductsAll" 
        :itemsPerPage="itemsPerPage" 
        :siblingCount="1" 
        :defaultPage="currentPage"
      >
        <PaginationContent>
          <!-- Tombol Previous -->
          <PaginationItem>
            <PaginationPrevious @click="getProducts(currentPage - 1)" />
          </PaginationItem>

          <!-- Nomor Halaman -->
          <PaginationItem v-for="p in totalPages" :key="p">
            <button
              class="px-3 py-1 rounded-md text-sm"
              :class="p === currentPage ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'"
              @click="getProducts(p)"
            >
              {{ p }}
            </button>
          </PaginationItem>

          <!-- Tombol Next -->
          <PaginationItem>
            <PaginationNext @click="getProducts(currentPage + 1)" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      </div>
    </Tabs>
  </div>
  </div>
</template>
