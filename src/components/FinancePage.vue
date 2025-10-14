<script setup>
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import TopNavbar from "./reusable/TopNavbar.vue"
import MenuFinance from "./reusable/MenuFinance.vue"
import api from "../axios"
import { useUserStore } from "@/stores/user"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const userStore = useUserStore()
const storeId = userStore?.user?.storeId

const finance = ref([])
const loading = ref(true)
const currentPage = ref(1)
const itemsPerPage = 5

const totalPages = computed(() =>
  Math.ceil(finance.value.length / itemsPerPage)
)

const paginatedFinance = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return finance.value.slice(start, start + itemsPerPage)
})

async function fetchFinance() {
  try {
    const res = await api.get("/finance", { params: { storeId } })
    if (res.data && res.data.data) {
      finance.value = res.data.data
    }
  } catch (err) {
    console.error("Gagal memuat data keuangan:", err)
  } finally {
    loading.value = false
  }
}

function getProducts(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

onMounted(fetchFinance)
</script>

<template>
  <TopNavbar title="Catatan Keuangan" />

  <div class="flex flex-col gap-3 items-start mb-10 pt-5 px-5">
    <MenuFinance />

    <h2 class="text-base font-semibold text-gray-800 mt-6">
      Catatan Keuangan
    </h2>

    <!-- Loader -->
    <div v-if="loading" class="text-center w-full py-6 text-gray-400">
      Memuat data...
    </div>

    <!-- Table Section -->
    <div v-else class="p-1 w-full">
      <div class="overflow-x-auto border rounded-lg">
        <table class="min-w-[750px] w-full border-collapse">
          <thead class="text-left text-sm text-gray-600 bg-gray-100">
            <tr>
              <th class="px-4 py-2">Sumber Dana</th>
              <th class="px-4 py-2">Jumlah</th>
              <th class="px-4 py-2">Tipe Transaksi</th>
              <th class="px-4 py-2">Catatan</th>
              <th class="px-4 py-2">Waktu</th>
              <th class="px-4 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="f in paginatedFinance"
              :key="f.id"
              class="border-b hover:bg-gray-50 text-sm"
            >
              <td class="px-4 py-2 font-medium">{{ f.name_fund }}</td>
              <td class="px-4 py-2">
                Rp{{ parseInt(f.amount).toLocaleString() }}
              </td>
              <td
                class="px-4 py-2 font-medium"
                :class="{
                  'text-green-600': f.type === 'income',
                  'text-red-600': f.type === 'expanse',
                }"
              >
                {{ f.status }}
              </td>
              <td class="px-4 py-2">{{ f.note }}</td>
              <td class="px-4 py-2">
                {{ new Date(f.createdAt).toLocaleString("id-ID") }}
              </td>
              <td class="px-4 py-2 text-center">
                <button
                  class="text-red-600 hover:underline text-xs ml-2"
                  @click="alert(`Hapus ID ${f.id}`)"
                >
                  Hapus
                </button>
              </td>
            </tr>

            <tr v-if="paginatedFinance.length === 0">
              <td colspan="6" class="text-center py-4 text-gray-400 text-sm">
                Tidak ada data keuangan.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex justify-center py-3">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious @click="getProducts(currentPage - 1)" />
              </PaginationItem>

              <PaginationItem
                v-for="p in totalPages"
                :key="p"
                @click="getProducts(p)"
              >
                <button
                  class="px-3 py-1 rounded-md text-sm"
                  :class="p === currentPage ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'"
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
    </div>
  </div>
</template>
