<script setup>
import { computed } from "vue";
import { X, Minus, Plus, ShoppingBag, Wallet } from "lucide-vue-next";

const props = defineProps({
  open: Boolean,
  cart: {
    type: Array,
    default: () => [],
  },
  totalAmount: Number,
  totalQty: Number,
  payment: Object,
  loadingPay: Boolean,
  paymentMethods: Array,
  suggestedAmounts: Array,
  finalTotal: Number,
  change: Number,
  formatCurrency: Function,
});

const emit = defineEmits(["close", "increase", "decrease", "pay"]);

const isEmpty = computed(() => !props.cart.length);
</script>
<template>
  <transition name="mobile-cart">
    <div
      v-if="open"
      class="fixed inset-0 z-[999] bg-black/40 backdrop-blur-[1px] flex items-end"
    >
      <!-- BACKDROP -->
      <div class="absolute inset-0" @click="emit('close')"></div>

      <!-- DRAWER -->
      <div
        class="relative w-full bg-white rounded-t-[28px] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
      >
        <!-- HANDLE -->
        <div class="flex justify-center pt-3 pb-2">
          <div class="w-14 h-1.5 rounded-full bg-slate-200"></div>
        </div>
        <!-- HEADER -->
        <div class="px-4 pb-4 border-b flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-800">
              Keranjang Belanja
            </h2>
            <p class="text-sm text-slate-500">{{ totalQty }} item dipilih</p>
          </div>

          <button
            @click="emit('close')"
            class="w-10 h-10 rounded-xl border flex items-center justify-center active:scale-95 transition"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <!-- EMPTY -->
        <div
          v-if="isEmpty"
          class="flex-1 flex flex-col items-center justify-center text-center p-8"
        >
          <div
            class="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4"
          >
            <ShoppingBag class="w-10 h-10 text-slate-400" />
          </div>

          <h3 class="font-semibold text-slate-700">Cart masih kosong</h3>

          <p class="text-sm text-slate-500 mt-1">
            Pilih produk untuk memulai transaksi
          </p>
        </div>
        <!-- CONTENT -->
        <template v-else>
          <!-- CART ITEMS -->
          <div class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <div
              v-for="item in cart"
              :key="item.id"
              class="border rounded-2xl p-3 bg-white"
            >
              <div class="flex gap-3 items-start">
                <!-- ICON -->
                <div
                  class="w-12 h-12 rounded-2xl bg-slate-100 border flex items-center justify-center shrink-0"
                >
                  <span class="text-sm font-bold text-slate-700 uppercase">
                    {{
                      item.name
                        ?.split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")
                    }}
                  </span>
                </div>
                <!-- INFO -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-800 truncate">
                    {{ item.name }}
                  </p>

                  <p class="text-sm text-blue-900 font-bold mt-1">
                    {{ formatCurrency(item.price) }}
                  </p>
                </div>
              </div>
              <!-- ACTION -->
              <div class="mt-3 flex items-center justify-between">
                <p class="text-xs text-slate-500">Subtotal</p>

                <div class="flex items-center gap-2">
                  <button
                    @click="emit('decrease', item)"
                    class="w-9 h-9 rounded-xl border flex items-center justify-center active:scale-95 transition"
                  >
                    <Minus class="w-4 h-4" />
                  </button>

                  <div
                    class="min-w-[40px] h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-semibold"
                  >
                    {{ item.qty }}
                  </div>

                  <button
                    @click="emit('increase', item)"
                    class="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center active:scale-95 transition"
                  >
                    <Plus class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- PAYMENT -->
          <div class="border-t bg-white p-4 space-y-4">
            <!-- TOTAL -->
            <div class="rounded-2xl bg-slate-50 border p-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-500">Total Pembayaran</span>

                <span class="text-xl font-bold text-slate-900">
                  {{ formatCurrency(finalTotal) }}
                </span>
              </div>

              <div
                v-if="payment.amountPaid > 0"
                class="mt-3 pt-3 border-t flex items-center justify-between text-sm"
              >
                <span class="text-slate-500">Kembalian</span>

                <span class="font-semibold text-emerald-600">
                  {{ formatCurrency(change) }}
                </span>
              </div>
            </div>
            <!-- PAYMENT INPUT -->
            <div>
              <label class="text-sm font-medium text-slate-700 block mb-2">
                Uang Dibayar
              </label>

              <input
                v-model="payment.amountPaid"
                type="number"
                placeholder="Masukkan nominal"
                class="w-full h-12 rounded-2xl border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <!-- QUICK AMOUNT -->
            <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                v-for="amount in suggestedAmounts"
                :key="amount"
                @click="payment.amountPaid = amount"
                class="shrink-0 px-3 py-2 rounded-xl border text-sm bg-white active:scale-95 transition"
              >
                {{ formatCurrency(amount) }}
              </button>
            </div>
            <!-- PAYMENT METHOD -->
            <div>
              <label class="text-sm font-medium text-slate-700 block mb-2">
                Metode Pembayaran
              </label>

              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="method in paymentMethods"
                  :key="method"
                  @click="payment.method = method"
                  class="h-11 rounded-2xl border text-sm font-medium transition"
                  :class="
                    payment.method === method
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'bg-white text-slate-700'
                  "
                >
                  {{ method }}
                </button>
              </div>
            </div>
            <!-- PAY BUTTON -->
            <button
              @click="emit('pay')"
              :disabled="loadingPay"
              class="w-full h-12 rounded-2xl bg-blue-900 text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-50"
            >
              <Wallet class="w-4 h-4" />

              <span>
                {{ loadingPay ? "Memproses..." : "Bayar Sekarang" }}
              </span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>
<style scoped>
.mobile-cart-enter-active,
.mobile-cart-leave-active {
  transition: all 0.25s ease;
}

.mobile-cart-enter-from,
.mobile-cart-leave-to {
  opacity: 0;
}

.mobile-cart-enter-from .relative,
.mobile-cart-leave-to .relative {
  transform: translateY(100%);
}

.mobile-cart-enter-active .relative,
.mobile-cart-leave-active .relative {
  transition: transform 0.25s ease;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
