<script setup>
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { X, Minus, Plus, ShoppingBag, Wallet } from "lucide-vue-next";

const showCustomer = ref(false);
const showDiscount = ref(false);

const discount = ref({
  type: "nominal",
  value: 0,
});

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
  isInject: Boolean,
  injectFunds: {
    type: Array,
    default: () => [],
  },
  customers: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "close",
  "increase",
  "decrease",
  "pay",
  "update:payment",
]);

const isEmpty = computed(() => !props.cart.length);

const lockBodyScroll = () => {
  document.body.style.overflow = "hidden";
  document.body.style.touchAction = "none";
};

const unlockBodyScroll = () => {
  document.body.style.overflow = "";
  document.body.style.touchAction = "";
};

watch(
  () => props.open,
  (val) => {
    if (val) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  unlockBodyScroll();
});

const updatePayment = (data) => {
  emit("update:payment", {
    ...props.payment,
    ...data,
  });
};
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
        class="relative w-full bg-white rounded-t-[28px] h-[92vh] flex flex-col shadow-2xl"
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
          <div class="flex-1 overflow-y-auto overscroll-contain">
            <div class="px-4 py-4 space-y-3">
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
              <!-- STATUS -->
              <div class="grid grid-cols-2 gap-2">
                <button
                  @click="
                    updatePayment({
                      status: 'paid',
                      customerName: '',
                    })
                  "
                  class="h-11 rounded-2xl border text-sm font-medium transition"
                  :class="
                    payment.status === 'paid'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white'
                  "
                >
                  Lunas
                </button>

                <button
                  @click="
                    updatePayment({
                      status: 'unpaid',
                      amountPaid: 0,
                    })
                  "
                  class="h-11 rounded-2xl border text-sm font-medium transition"
                  :class="
                    payment.status === 'unpaid'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white'
                  "
                >
                  Piutang
                </button>
              </div>

              <!-- PAYMENT METHOD -->
              <div v-if="payment.status === 'paid'">
                <label class="text-sm font-medium text-slate-700 block mb-2">
                  Metode Pembayaran
                </label>

                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="method in paymentMethods"
                    :key="method"
                    @click="updatePayment({ method })"
                    class="h-11 rounded-2xl border text-sm font-medium transition capitalize"
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

              <!-- FUND SOURCE -->
              <div v-if="isInject">
                <label class="text-sm font-medium text-slate-700 block mb-2">
                  Sumber Dana Inject
                </label>

                <select
                  class="w-full h-12 rounded-2xl border px-4 text-sm bg-white"
                  :value="payment.fundSource"
                  @change="updatePayment({ fundSource: $event.target.value })"
                >
                  <option value="">Pilih sumber dana</option>

                  <option v-for="f in injectFunds" :key="f.id" :value="f.id">
                    {{ f.nameBank || f.nameAccount || f.type }}
                  </option>
                </select>
              </div>

              <!-- CUSTOMER -->
              <div v-if="payment.status === 'unpaid'">
                <label class="text-sm font-medium text-slate-700 block mb-2">
                  Nama Pelanggan
                </label>

                <input
                  type="text"
                  :value="payment.customerName"
                  @input="
                    updatePayment({
                      customerName: $event.target.value,
                    })
                  "
                  placeholder="Masukkan nama pelanggan"
                  class="w-full h-12 rounded-2xl border px-4 text-sm"
                />
              </div>

              <!-- PAYMENT INPUT -->
              <div v-if="payment.status === 'paid'">
                <label class="text-sm font-medium text-slate-700 block mb-2">
                  Uang Dibayar
                </label>

                <input
                  :value="payment.amountPaid"
                  @input="
                    updatePayment({
                      amountPaid: Number($event.target.value) || 0,
                    })
                  "
                  type="number"
                  placeholder="Masukkan nominal"
                  class="w-full h-12 rounded-2xl border px-4 text-sm"
                />
              </div>

              <!-- QUICK CASH -->
              <div
                v-if="payment.status === 'paid'"
                class="flex gap-2 overflow-x-auto no-scrollbar pb-1"
              >
                <button
                  v-for="amount in suggestedAmounts"
                  :key="amount"
                  @click="updatePayment({ amountPaid: amount })"
                  class="shrink-0 px-3 py-2 rounded-xl border text-sm bg-white"
                >
                  {{ formatCurrency(amount) }}
                </button>
              </div>

              <!-- EXTRA ACTION -->
              <div class="grid grid-cols-2 gap-2">
                <button
                  @click="showCustomer = !showCustomer"
                  class="h-11 rounded-2xl border text-sm"
                  :class="showCustomer ? 'bg-blue-900 text-white' : 'bg-white'"
                >
                  Pelanggan
                </button>

                <button
                  @click="showDiscount = !showDiscount"
                  class="h-11 rounded-2xl border text-sm"
                  :class="
                    showDiscount ? 'bg-purple-600 text-white' : 'bg-white'
                  "
                >
                  Diskon
                </button>
              </div>

              <!-- DISCOUNT -->
              <div v-if="showDiscount" class="flex gap-2">
                <select
                  v-model="discount.type"
                  class="w-24 border rounded-2xl px-3 text-sm"
                >
                  <option value="nominal">Rp</option>
                  <option value="percent">%</option>
                </select>

                <input
                  v-model="discount.value"
                  type="number"
                  placeholder="Diskon"
                  class="flex-1 h-12 rounded-2xl border px-4 text-sm"
                />
              </div>

              <!-- TOTAL -->
              <div class="rounded-2xl bg-slate-50 border p-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-500">Total</span>

                  <span class="text-xl font-bold text-slate-900">
                    {{ formatCurrency(finalTotal) }}
                  </span>
                </div>

                <div
                  v-if="payment.amountPaid > 0"
                  class="mt-3 pt-3 border-t flex justify-between text-sm"
                >
                  <span class="text-slate-500">Kembalian</span>

                  <span class="font-semibold text-emerald-600">
                    {{ formatCurrency(change) }}
                  </span>
                </div>
              </div>

              <!-- PAY BUTTON -->
              <div class="sticky bottom-0 bg-white border-t p-4">
                <button
                  @click="emit('pay')"
                  :disabled="loadingPay"
                  class="w-full h-12 rounded-2xl bg-blue-900 text-white font-semibold flex items-center justify-center gap-2"
                >
                  <Wallet class="w-4 h-4" />

                  <span>
                    {{
                      loadingPay
                        ? "Memproses..."
                        : payment.status === "paid"
                          ? "Bayar Sekarang"
                          : "Simpan Piutang"
                    }}
                  </span>
                </button>
              </div>
            </div>
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

.overscroll-contain {
  overscroll-behavior: contain;
}
</style>
