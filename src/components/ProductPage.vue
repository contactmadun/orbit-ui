<script setup>
import api from '../axios'
import MenuProduct from './reusable/MenuProduct.vue'
import { ref, computed, onMounted } from "vue"
import { ChevronDown } from "lucide-vue-next"
import { Input } from "@/components/ui/input"
import TopNavbar from './reusable/TopNavbar.vue'
import { useUserStore } from "@/stores/user"
import { Button } from "@/components/ui/button"
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
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const userStore = useUserStore()

// const deleting = ref(false)

const bestProduct = ref("Aksesoris")
const totalSales = ref(4.956)
const percentage = ref(25)
const CHART_HEIGHT_PX = 192

// Data produk
const products = ref([])
const productsAll = ref([]) // semua produk untuk pencarian global
const search = ref("")
const selectedCategory = ref("all")
const selectedPeriod = ref("monthly")
const currentPage = ref(1)
const totalPages = ref(1)
const totalProductsAll = ref(0)
const itemsPerPage = 10

const deleteProduct = async (id) => {
  if (!id) return
  try {
    await api.delete(`/products/delete/${id}`)
    // refresh data
    await getProducts(currentPage.value)
    await getAllProducts()
  } catch (err) {
    console.error("Gagal menghapus produk:", err)
    alert("Gagal menghapus produk.")
  }
}

// --- FETCH PRODUK ---
const getProducts = async (page = 1) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  try {
    const res = await api.get(`/products?storeId=${userStore.storeId}&page=${page}`)
    products.value = res.data.data
    totalPages.value = res.data.totalPages || 1
    totalProductsAll.value = res.data.totalProducts || 0
  } catch (err) {
    console.error("Gagal ambil produk:", err)
  }
}

// --- FETCH SEMUA PRODUK UNTUK SEARCH GLOBAL ---
const getAllProducts = async () => {
  try {
    const res = await api.get(`/products?storeId=${userStore.storeId}&all=true`)
    productsAll.value = res.data.data || []
  } catch (err) {
    console.error("Gagal ambil semua produk:", err)
  }
}

// --- FILTER PRODUK ---
const filteredProducts = computed(() => {
  let sourceData = search.value ? productsAll.value : products.value

  return sourceData.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.value.toLowerCase()) ?? false

    if (selectedCategory.value === "Out of Stock") {
      return matchSearch && p.stok === 0 && p.categorie?.name !== "Inject"
    }

    return matchSearch
  })
})

// --- DATA KATEGORI ---
const categories = ref([
  { name: "Voucher", value: 150 },
  { name: "Kartu", value: 90 },
  { name: "Aksesoris", value: 300 },
  { name: "Pulsa", value: 100 },
  { name: "Data", value: 80 },
  { name: "Lainnya", value: 50 },
])

// --- NORMALISASI ---
const normalized = computed(() => {
  const max = Math.max(...categories.value.map(c => c.value), 1)
  return categories.value.map(c => {
    const ratio = c.value / max
    const px = Math.round(ratio * CHART_HEIGHT_PX)
    return { ...c, px }
  })
})

// --- PROPS ---
const props = defineProps({
  sales: { type: Number, default: 2500 },
  expenses: { type: Number, default: 360 },
  oos: { type: Number, default: 125 }
})

onMounted(() => {
  getProducts()
  getAllProducts()
})
</script>

<template>
  <TopNavbar title="Produk" />
  <div class="flex flex-col gap-3 items-start mb-10 pt-10 px-5">

    <section class="w-full bg-white">
      <div class="grid grid-cols-2 divide-x divide-gray-200 text-left">
        <div class="flex flex-col items-start py-4 px-2">
          <span class="text-sm font-medium text-gray-800 mb-1">Total Produk</span>
          <span class="text-lg font-bold text-gray-800 mb-2">
            {{ totalProductsAll }}
          </span>
          <span class="text-xs text-gray-400">Jumlah keseluruhan produk</span>
        </div>

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

    <h2 class="text-base font-semibold text-gray-800 mt-2">Main Menu</h2>
    <MenuProduct />

    <h2 class="text-base font-semibold text-gray-800 mt-6">Daftar Produk</h2>

    <div class="p-1 w-full">
      <Tabs default-value="all" class="w-full">
        <TabsList class="mb-4">
          <TabsTrigger value="all" @click="selectedCategory = 'all'">Semua Produk</TabsTrigger>
          <TabsTrigger value="Out of Stock" @click="selectedCategory = 'Out of Stock'">Out of Stock</TabsTrigger>
        </TabsList>

        <div class="overflow-x-auto border rounded-lg">
          <table class="min-w-[800px] w-full border-collapse">
            <thead class="text-left text-sm text-gray-600">
              <tr>
                <th colspan="7" class="px-4 py-3">
                  <div class="flex flex-wrap gap-3 items-center">
                    <input
                      v-model="search"
                      type="text"
                      placeholder="Search product..."
                      class="border rounded-md px-3 py-1 text-sm w-64 focus:ring focus:ring-blue-200"
                    />

                    <Select v-model="selectedCategory">
                      <SelectTrigger class="w-[180px]">
                        <SelectValue placeholder="Filter kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
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
                <td class="px-4 py-2">{{ product.categorie?.name === "Inject" ? "∞" : product.stok }}</td>
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
                <td class="px-4 py-2">Rp{{ product.retailPrice.toLocaleString('id-ID') }}</td>
                <td class="px-4 py-2">
                  <RouterLink
                    :to="`/edit-product/${product.id}`"
                    class="text-blue-600 hover:underline text-xs"
                  >
                    Edit
                  </RouterLink>

                  <!-- AlertDialog Konfirmasi Hapus -->
                  <AlertDialog>
                    <AlertDialogTrigger as-child>
                      <Button variant="destructive" class="ml-2 text-xs py-1 h-auto">Hapus</Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah kamu yakin ingin menghapus produk <b>{{ product.name }}</b>? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Tidak</AlertDialogCancel>
                        <AlertDialogAction @click="deleteProduct(product.id)">Ya, Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination (disable jika search aktif) -->
          <div v-if="!search" class="p-2">
            <Pagination
              v-slot="{ page }"
              :total="totalProductsAll"
              :itemsPerPage="itemsPerPage"
              :siblingCount="1"
              :defaultPage="currentPage"
            >
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious @click="getProducts(currentPage - 1)" />
                </PaginationItem>

                <PaginationItem v-for="p in totalPages" :key="p">
                  <button
                    class="px-3 py-1 rounded-md text-sm"
                    :class="p === currentPage ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'"
                    @click="getProducts(p)"
                  >
                    {{ p }}
                  </button>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext @click="getProducts(currentPage + 1)" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </Tabs>
    </div>
  </div>
</template>
