import { defineStore } from "pinia"
import { ref, computed } from "vue"

export const useCartStore = defineStore("cart", () => {
  const cart = ref({}) // { id: qty }
  const products = ref([]) // simpan data produk hasil fetch
  
  // hitung total pemasukan
  const totalPemasukan = computed(() => {
    return Object.entries(cart.value).reduce((sum, [id, qty]) => {
      const product = products.value.find(p => p.id == id)
      if (!product) return sum
      return sum + (product.retailPrice * qty)
    }, 0)
  })

  // ambil produk + qty untuk halaman transaksi
  const cartItems = computed(() => {
    return Object.entries(cart.value).map(([id, qty]) => {
      const product = products.value.find(p => p.id == id)
      return {
        ...product,
        qty
      }
    })
  })

  const resetCart = () => {
    cart.value = {}
  }

  return {
    cart,
    products,
    totalPemasukan,
    cartItems,
    resetCart,
  }
})
