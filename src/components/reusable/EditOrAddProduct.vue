<script setup>
import api from '@/axios'
import { Check, ChevronsUpDown, Search } from "lucide-vue-next"
import { ref, onMounted } from 'vue'
import TopNavbar from './TopNavbar.vue'
import Label from '@/components/ui/label/Label.vue'
import Input from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'
import { Switch } from "@/components/ui/switch"
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
import { useRoute, useRouter } from 'vue-router'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

// Mode edit
const productId = route.params.id
const isEditMode = !!productId

// State
const brands = ref([])
const categories = ref([])
const name = ref("")
const description = ref("")
const purchasePrice = useCurrencyInput()
const agentPrice = useCurrencyInput()
const retailPrice = useCurrencyInput()
const stok = ref("")
const minimumStok = ref("")
const selectedBrand = ref(null)
const selectedCategory = ref(null)
const typeProduct = ref(false)

// Ambil data brand & kategori
const fetchBrands = async () => {
  try {
    const res = await api.get(`/brand?storeId=${userStore.storeId}`)
    brands.value = res.data.map(b => ({ label: b.name, value: b.id }))
  } catch (err) {
    console.error("Gagal ambil brand:", err)
  }
}

const fetchCategories = async () => {
  try {
    const res = await api.get(`/category?storeId=${userStore.storeId}`)
    categories.value = res.data.map(c => ({ label: c.name, value: c.id }))
  } catch (err) {
    console.error("Gagal ambil kategori:", err)
  }
}

// Ambil detail produk (untuk edit)
const fetchProductDetail = async () => {
  if (!isEditMode) return
  try {
    const res = await api.get(`/products/${productId}`)
    const p = res.data

    name.value = p.name
    description.value = p.description || ""
    purchasePrice.model.value = p.purchasePrice?.toString() || ""
    agentPrice.model.value = p.agentPrice?.toString() || ""
    retailPrice.model.value = p.retailPrice?.toString() || ""
    stok.value = p.stok?.toString() || ""
    minimumStok.value = p.minimumStok?.toString() || ""
    typeProduct.value = p.typeProduct === "inject"

    selectedBrand.value = p.brand ? { label: p.brand.name, value: p.brandId } : null
    selectedCategory.value = p.categorie ? { label: p.categorie.name, value: p.categoryId } : null
  } catch (err) {
    console.error("Gagal ambil detail produk:", err)
    alert("Produk tidak ditemukan ❌")
    router.push('/product')
  }
}

onMounted(() => {
  fetchBrands()
  fetchCategories()
  fetchProductDetail()
})

// Simpan produk
const saveProduct = async () => {
  try {
    const payload = {
      storeId: userStore.storeId,
      name: name.value,
      brandId: selectedBrand.value?.value,
      categoryId: selectedCategory.value?.value,
      description: description.value,
      purchasePrice: purchasePrice.parse(),
      typeProduct: typeProduct.value,
      agentPrice: agentPrice.parse() || 0,
      retailPrice: retailPrice.parse(),
      stok: stok.value || 0,
      minimumStok: minimumStok.value || 0
    }

    if (isEditMode) {
      await api.put(`/products/${productId}`, payload)
      alert("Produk berhasil diperbarui ✅")
    } else {
      await api.post('/products', payload)
      alert("Produk berhasil disimpan ✅")
    }

    router.push('/product')
  } catch (err) {
    console.error("Error simpan produk:", err)
    alert("Gagal menyimpan produk ❌")
  }
}
</script>

<template>
  <TopNavbar :title="isEditMode ? 'Edit Produk' : 'Tambah Produk'" />
  <form
    @submit.prevent="saveProduct"
    class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-5 px-5 w-full"
  >
    <div class="w-full">
      <h1 class="font-medium mb-7">{{ isEditMode ? 'Edit Info Produk' : 'Info Produk' }}</h1>

      <!-- Nama Produk -->
      <div class="grid gap-2 w-full">
        <Label for="name" class="block text-left text-gray-500">Nama Produk</Label>
        <Input id="name" v-model="name" placeholder="Voucher Data Tsel" class="w-full text-sm" required />
      </div>

      <!-- Brand & Kategori -->
      <div class="grid grid-cols-2 gap-5 text-left">
        <!-- Brand -->
        <div class="flex flex-col items-start py-4">
          <Label class="block text-left text-gray-500 mb-2">Brand</Label>
          <Combobox v-model="selectedBrand" by="value">
            <ComboboxAnchor as-child>
              <ComboboxTrigger as-child>
                <Button variant="outline" class="w-[150px] justify-between text-gray-500 font-normal">
                  {{ selectedBrand?.label ?? 'Pilih Brand' }}
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </ComboboxTrigger>
            </ComboboxAnchor>

            <ComboboxList class="w-[150px]">
              <div class="relative w-full max-w-sm items-center">
                <ComboboxInput class="pl-1 focus-visible:ring-0 border-0 border-b rounded-none h-10" placeholder="Cari Brand" />
                <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                  <Search class="size-4 text-muted-foreground" />
                </span>
              </div>
              <ComboboxEmpty>Brand tidak ditemukan.</ComboboxEmpty>
              <ComboboxGroup>
                <ComboboxItem
                  v-for="brand in brands"
                  :key="brand.value"
                  :value="brand"
                >
                  {{ brand.label }}
                  <ComboboxItemIndicator>
                    <Check class="ml-auto h-4 w-4" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              </ComboboxGroup>
            </ComboboxList>
          </Combobox>
        </div>

        <!-- Kategori -->
        <div class="flex flex-col items-start py-4">
          <Label class="block text-left text-gray-500 mb-2">Kategori</Label>
          <Combobox v-model="selectedCategory" by="value">
            <ComboboxAnchor as-child>
              <ComboboxTrigger as-child>
                <Button variant="outline" class="w-[150px] justify-between text-gray-500 font-normal">
                  {{ selectedCategory?.label ?? 'Pilih Kategori' }}
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </ComboboxTrigger>
            </ComboboxAnchor>

            <ComboboxList class="w-[150px]">
              <div class="relative w-full max-w-sm items-center">
                <ComboboxInput class="pl-1 focus-visible:ring-0 border-0 border-b rounded-none h-10" placeholder="Cari Kategori" />
                <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                  <Search class="size-4 text-muted-foreground" />
                </span>
              </div>
              <ComboboxEmpty>Kategori tidak ditemukan.</ComboboxEmpty>
              <ComboboxGroup>
                <ComboboxItem
                  v-for="category in categories"
                  :key="category.value"
                  :value="category"
                >
                  {{ category.label }}
                  <ComboboxItemIndicator>
                    <Check class="ml-auto h-4 w-4" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              </ComboboxGroup>
            </ComboboxList>
          </Combobox>
        </div>
      </div>

      <!-- Deskripsi -->
      <div class="grid w-full gap-1.5 mb-4">
        <Label for="description" class="text-gray-500">Deskripsi Produk</Label>
        <Textarea id="description" v-model="description" placeholder="Deskripsi produk" class="text-sm" />
        <p class="text-sm text-muted-foreground">Lengkapi deskripsi produkmu.</p>
      </div>

      <div class="flex items-center space-x-2">
        <Switch id="typeProduct" v-model="typeProduct" />
        <Label for="typeProduct" class="text-gray-500">Produk Inject</Label>
      </div>

      <div class="border-b border-dashed mt-5 w-full"></div>

      <!-- Harga -->
      <h1 class="font-medium mb-7 mt-5">Info Harga</h1>
      <div class="grid gap-2 w-full mb-4">
        <Label for="purchasePrice" class="block text-left text-gray-500">Harga Modal</Label>
        <Input id="purchasePrice" v-model="purchasePrice.model" placeholder="Harga Modal" type="tel" class="w-full text-sm" required />
      </div>
      <div v-if="!typeProduct" class="grid gap-2 w-full mb-4">
        <Label for="agentPrice" class="block text-left text-gray-500">Harga Agen</Label>
        <Input id="agentPrice" v-model="agentPrice.model" placeholder="Harga Agen" type="tel" class="w-full text-sm" required />
      </div>
      <div class="grid gap-2 w-full mb-4">
        <Label for="retailPrice" class="block text-left text-gray-500">Harga Jual</Label>
        <Input id="retailPrice" v-model="retailPrice.model" placeholder="Harga Jual" type="tel" class="w-full text-sm" required />
      </div>

      <!-- Stok -->
      <div v-if="!typeProduct">
        <div class="border-b border-dashed mt-5 w-full"></div>
        <h1 class="font-medium mb-7 mt-5">Info Stok</h1>
        <div class="grid gap-2 w-full mb-4">
          <Label for="stok" class="block text-left text-gray-500">Stok Produk</Label>
          <Input id="stok" v-model="stok" placeholder="Stok Produk" type="tel" class="w-full text-sm" required />
        </div>
        <div class="grid gap-2 w-full mb-4">
          <Label for="minimumStok" class="block text-left text-gray-500">Minimum Stok</Label>
          <Input id="minimumStok" v-model="minimumStok" placeholder="Minimum Stok Produk" type="tel" class="w-full text-sm" required />
        </div>
      </div>
    </div>

    <!-- Submit -->
    <div class="w-full mt-6">
      <Button type="submit" class="w-full text-white">
        {{ isEditMode ? 'Update Produk' : 'Simpan Data' }}
      </Button>
    </div>
  </form>
</template>
