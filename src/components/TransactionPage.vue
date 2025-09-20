<script setup>
import { ref, computed } from "vue"
import Button from './ui/button/Button.vue'
import { RouterLink } from "vue-router"
import { useCartStore } from "@/stores/cart"
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
        <RouterLink to="/list-product">
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
              <span class="inline-block text-xs text-gray-400 ml-1">✏️</span>
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
</template>
