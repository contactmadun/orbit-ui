<script setup>
import { ref, computed } from "vue"
import Button from './ui/button/Button.vue'
import { RouterLink } from "vue-router"
import { useCartStore } from "@/stores/cart"
import Label from './ui/label/Label.vue'
import Input from './ui/input/Input.vue'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from "@/components/ui/number-field"

const tabs = ["Transaksi Produk", "Transaksi Manual", "Transfer", "Tarik Tunai"]
const activeTab = ref("Transaksi Produk")

// ambil store
const cartStore = useCartStore()

// produk yg ada di keranjang
const cartProducts = computed(() => {
  return cartStore.products.filter(p => cartStore.cart[p.id])
})

// --- tambahan: catatan & status
const catatan = ref("")
const statusTransaksi = ref("Lunas") // default Lunas

// fungsi update jumlah
function updateQty(id, val) {
  if (val <= 0) {
    const newCart = { ...cartStore.cart }
    delete newCart[id]
    cartStore.cart = newCart
  } else {
    cartStore.cart = { ...cartStore.cart, [id]: val }
  }
}

// total transaksi
const totalTransaksi = computed(() => {
  return cartProducts.value.reduce((sum, p) => {
    return sum + (p.retailPrice * cartStore.cart[p.id])
  }, 0)
})

// simpan transaksi
function simpanTransaksi() {
  console.log("Transaksi disimpan:", {
    items: cartStore.cart,
    total: totalTransaksi.value,
    catatan: catatan.value,
    status: statusTransaksi.value
  })
}
</script>

<template>
  <div class="w-full border-b">
    <nav class="flex justify-around">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="activeTab = tab"
        class="relative px-3 py-2 text-sm font-medium text-gray-700"
        :class="activeTab === tab ? 'text-black' : 'text-gray-500'"
      >
        {{ tab }}
        <!-- Underline active -->
        <span
          v-if="activeTab === tab"
          class="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-blue-500 rounded"
        ></span>
      </button>
    </nav>
  </div>

  <!-- Content -->
  <div class="p-4">
    <div v-if="activeTab === 'Transaksi Produk'">
      <div class="flex justify-between">
        <h4>Produk</h4>
        <RouterLink v-if="cartProducts.length === 0" to="/list-product">
          <Button variant="outline">Pilih Produk</Button>
        </RouterLink>
      </div>
      <!-- daftar produk -->
      <div v-for="p in cartProducts" :key="p.id" class="border-b py-3">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-medium">{{ p.name }}</p>
            <p class="text-blue-600 font-semibold">
              Rp{{ p.retailPrice.toLocaleString("id-ID") }}
            </p>
            <p class="text-sm text-gray-500">Modal : Rp{{ p.purchasePrice.toLocaleString("id-ID") }}</p>
          </div>
          <NumberField
            :model-value="cartStore.cart[p.id]"
            :min="0"
            class="flex items-center"
            @update:model-value="val => updateQty(p.id, val)"
          >
            <NumberFieldContent>
              <NumberFieldDecrement>-</NumberFieldDecrement>
              <NumberFieldInput class="w-24 text-center" />
              <NumberFieldIncrement>+</NumberFieldIncrement>
            </NumberFieldContent>
          </NumberField>
        </div>
      </div>
        <div v-if="cartProducts.length > 0" class="flex justify-center mt-4">
          <RouterLink to="/list-product">
            <Button variant="outline">+ Tambah produk</Button>
          </RouterLink>
        </div>
        <div class="mt-6 space-y-4">
        <div class="grid gap-2 w-full">
        <Label for="note" class="block text-left text-gray-500">Catatan</Label>
        <Input id="note" v-model="catatan" placeholder="" class="w-full text-sm"/>
      </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-500">Status transaksi</label>
          <div class="flex gap-2">
            <Button
              :variant="statusTransaksi === 'Lunas' ? 'default' : 'outline'"
              class="flex-1"
              @click="statusTransaksi = 'Lunas'"
            >
              Lunas
            </Button>
            <Button
              :variant="statusTransaksi === 'Belum Lunas' ? 'default' : 'outline'"
              class="flex-1"
              @click="statusTransaksi = 'Belum Lunas'"
            >
              Belum Lunas
            </Button>
          </div>
        </div>
       </div>
    </div>
    <div v-else-if="activeTab === 'Transaksi Manual'">
      <p>Konten Pengeluaran</p>
    </div>
    <div v-else-if="activeTab === 'Transfer'">
      <p>Konten Hutang pelanggan</p>
    </div>
    <div v-else>
      <p>Konten Hutang saya</p>
    </div>
  </div>
  <div
    v-if="cartProducts.length > 0"
    class="fixed bottom-0 left-0 right-0 border-t bg-white p-4 flex justify-between items-center"
  >
    <div class="flex flex-col">
      <span class="text-sm text-gray-600">Total transaksi</span>
      <span class="font-semibold text-gray-900">
        Rp{{ totalTransaksi.toLocaleString("id-ID") }}
      </span>
    </div>
    <Button class="bg-pink-600 hover:bg-pink-700 text-white" @click="simpanTransaksi">
      Simpan Transaksi
    </Button>
  </div>
</template>
