<script setup>
// import Label from './ui/label/Label.vue'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from './ui/sheet'
import Input from './ui/input/Input.vue'
import Button from './ui/button/Button.vue'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import api from '../axios'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import TopNavbar from './reusable/TopNavbar.vue'

const products = ref([
  {
    id: 1,
    name: "Voucher",
    status: "Active",
  },
  {
    id: 2,
    name: "Kartu",
    status: "Active",
  },
  {
    id: 3,
    name: "Aksesoris",
    status: "Active",
  },
])

// Search & filter
const search = ref("")
const selectedCategory = ref("all")

// Filter hasil berdasarkan search & kategori
const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.value.toLowerCase())
    const matchCategory = selectedCategory.value === "all" || p.category === selectedCategory.value
    return matchSearch && matchCategory
  })
})

// Form tambah kategori
const newCategory = ref({ name: "", status: "aktif" })
const saveCategory = () => {
  console.log("Kategori baru:", newCategory.value)
  // Tambahkan ke API atau state sesuai kebutuhan
  newCategory.value = { name: "", status: "aktif" }
}

</script>

<template>
    <TopNavbar title="Brand" />
    <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-5 px-5">
        <h2 class="text-base font-semibold text-gray-800 mb-5">
            Brand
        </h2>
         <!-- Tombol Tambah Kategori -->
    <div class="flex justify-between w-full items-center">
      <Sheet>
        <SheetTrigger as-child>
          <Button class="flex items-center gap-2">
            Tambah Brand
          </Button>
        </SheetTrigger>
        <SheetContent side="right" class="w-[300px] sm:w-[400px] px-4">
          <SheetHeader class="-ml-4">
            <SheetTitle>Tambah Brand</SheetTitle>
            <SheetDescription>Isi detail brand baru di bawah ini</SheetDescription>
          </SheetHeader>
          <div class="mt-4 flex flex-col gap-4">
            <!-- Nama Kategori -->
            <div>
              <label class="text-sm font-medium">Nama Brand</label>
              <Input v-model="newCategory.name" placeholder="Masukkan nama kategori" class="mt-1" />
            </div>

            <!-- Status -->
            <div>
              <label class="text-sm font-medium">Status</label>
              <Select v-model="newCategory.status">
                <SelectTrigger class="w-full mt-1">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="tidak aktif">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter class="mt-6 w-full">
            <Button @click="saveCategory">Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
        <div class="w-full">
            <div class="overflow-x-auto border rounded-lg">
            <table class="min-w-[500px] w-full border-collapse">
              <thead class="text-left text-sm text-gray-600">
                <tr>
                  <th colspan="7" class="px-4 py-3">
                    <div class="flex flex-wrap gap-3 items-center">
                      <!-- Search -->
                      <input
                        v-model="search"
                        type="text"
                        placeholder="Search Kategori..."
                        class="border rounded-md px-3 py-1 text-sm w-64 focus:ring focus:ring-blue-200"
                      />
    
                      <!-- Filter Status -->
                      <Select v-model="selectedCategory">
                        <SelectTrigger class="w-[125px]">
                          <SelectValue placeholder="Filter kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua</SelectItem>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="non-active">Tidak Aktif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </th>
                </tr>
                <tr class="bg-gray-100">
                  <th class="px-4 py-2">Nama Kategori</th>
                  <th class="px-4 py-2">Status</th>
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
                  <td class="px-4 py-2">
                    <button class="text-blue-600 hover:underline text-xs">Edit</button>
                    <button class="text-red-600 hover:underline text-xs ml-2">Hapus</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
    </div>
</template>