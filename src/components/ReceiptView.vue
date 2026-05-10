<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Printer, Share2, ArrowLeft, CheckCircle2 } from "lucide-vue-next";

/**
 * =========================================
 * MOCK DATA
 * nanti ganti fetch API:
 * GET /sale/:id
 * =========================================
 */

const router = useRouter();
const route = useRoute();

const receipt = {
  invoiceNumber: "PST/20260510/0001",

  store: {
    name: "Kasir Pusat Store",
    address: "Jl. Raya Utama No. 123, Jakarta Pusat",
    phone: "021-1234567",
  },

  cashier: "Administrator Pusat",

  paymentMethod: "Cash",

  createdAt: "10/05/2026 09:43",

  total: 25000,
  paid: 50000,
  change: 25000,

  items: [
    {
      id: 1,
      name: "Alpukat 500g",
      qty: 1,
      unit: "bungkus",
      price: 25000,
      subtotal: 25000,
    },
  ],
};

const formatCurrency = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val || 0);

const totalQty = computed(() =>
  receipt.items.reduce((sum, i) => sum + i.qty, 0),
);

const handlePrint = () => {
  window.print();
};

const handleNewTransaction = () => {
  router.replace("/pos/transaction");
};

const handleShare = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: "Struk Pembayaran",
        text: `Struk ${receipt.invoiceNumber}`,
        url: window.location.href,
      });
    } else {
      alert("Browser tidak mendukung fitur share");
    }
  } catch (err) {
    console.error(err);
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <!-- MOBILE HEADER -->
    <div
      class="sticky top-0 z-20 bg-white/90 backdrop-blur border-b px-4 h-14 flex items-center justify-between print:hidden"
    >
      <button
        @click="router.back()"
        class="w-10 h-10 rounded-xl border flex items-center justify-center active:scale-95 transition"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>

      <div class="text-center">
        <h1 class="text-sm font-semibold text-slate-800">Detail Transaksi</h1>

        <p class="text-[11px] text-slate-500">
          {{ receipt.invoiceNumber }}
        </p>
      </div>

      <div class="w-10"></div>
    </div>

    <!-- CONTENT -->
    <div class="max-w-md mx-auto px-4 py-5 pb-40">
      <!-- SUCCESS -->
      <div class="flex flex-col items-center mb-5 print:hidden">
        <div
          class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center"
        >
          <CheckCircle2 class="w-8 h-8 text-emerald-600" />
        </div>

        <h2 class="mt-3 text-xl font-bold text-slate-800">
          Transaksi Berhasil
        </h2>

        <p class="text-sm text-slate-500 text-center mt-1">
          Pembayaran berhasil diproses
        </p>
      </div>

      <!-- RECEIPT CARD -->
      <div
        class="bg-white rounded-[28px] shadow-sm border overflow-hidden print:shadow-none print:border-none"
      >
        <!-- STORE -->
        <div class="px-6 pt-7 pb-5 text-center border-b border-dashed">
          <h2 class="text-xl font-bold text-slate-900">
            {{ receipt.store.name }}
          </h2>

          <p class="mt-3 text-sm text-slate-500 leading-6">
            {{ receipt.store.address }}
            <br />
            Telp: {{ receipt.store.phone }}
          </p>
        </div>

        <!-- INFO -->
        <div class="px-6 py-5 border-b border-dashed space-y-3 text-sm">
          <div class="flex items-start justify-between gap-4">
            <span class="text-slate-500">No. Struk</span>

            <span class="font-semibold text-right text-slate-800">
              {{ receipt.invoiceNumber }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-4">
            <span class="text-slate-500">Tanggal</span>

            <span class="text-slate-800">
              {{ receipt.createdAt }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-4">
            <span class="text-slate-500">Kasir</span>

            <span class="text-right text-slate-800">
              {{ receipt.cashier }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-4">
            <span class="text-slate-500">Metode</span>

            <span class="text-slate-800">
              {{ receipt.paymentMethod }}
            </span>
          </div>
        </div>

        <!-- TABLE -->
        <div class="px-6 py-5">
          <!-- HEADER -->
          <div
            class="grid grid-cols-12 gap-2 pb-3 border-b text-sm font-semibold text-slate-700"
          >
            <div class="col-span-6">Item</div>

            <div class="col-span-2 text-center">Qty</div>

            <div class="col-span-4 text-right">Subtotal</div>
          </div>

          <!-- ITEMS -->
          <div class="divide-y">
            <div
              v-for="item in receipt.items"
              :key="item.id"
              class="grid grid-cols-12 gap-2 py-4"
            >
              <!-- ITEM -->
              <div class="col-span-6 min-w-0">
                <p class="font-semibold text-slate-800 leading-5">
                  {{ item.name }}
                </p>

                <p class="text-xs text-slate-500 mt-1">
                  {{ formatCurrency(item.price) }}
                  <span class="mx-1">|</span>
                  {{ item.unit }}
                </p>
              </div>

              <!-- QTY -->
              <div
                class="col-span-2 flex items-start justify-center font-medium text-slate-700"
              >
                {{ item.qty }}
              </div>

              <!-- SUBTOTAL -->
              <div class="col-span-4 text-right font-semibold text-slate-800">
                {{ formatCurrency(item.subtotal) }}
              </div>
            </div>
          </div>
        </div>

        <!-- TOTAL -->
        <div class="px-6 py-5 border-t border-dashed space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-2xl font-bold text-slate-900"> Total </span>

            <span class="text-3xl font-bold text-blue-700">
              {{ formatCurrency(receipt.total) }}
            </span>
          </div>

          <div class="space-y-2 pt-1">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Bayar</span>

              <span class="text-lg text-slate-800">
                {{ formatCurrency(receipt.paid) }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-slate-500">Kembalian</span>

              <span class="text-xl font-bold text-emerald-600">
                {{ formatCurrency(receipt.change) }}
              </span>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="px-6 py-7 border-t border-dashed text-center">
          <h3 class="text-xl font-semibold text-slate-800">
            Terima kasih atas kunjungan Anda!
          </h3>

          <p class="text-slate-500 mt-4 leading-7 max-w-[260px] mx-auto">
            Barang yang sudah dibeli tidak dapat ditukar/dikembalikan
          </p>
        </div>
      </div>
    </div>

    <!-- STICKY ACTION -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3 print:hidden"
    >
      <div class="max-w-md mx-auto space-y-3">
        <!-- PRINT -->
        <button
          @click="handlePrint"
          class="w-full h-14 rounded-2xl bg-blue-600 text-white font-semibold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition"
        >
          <Printer class="w-5 h-5" />
          Cetak Browser
        </button>

        <!-- SHARE -->
        <button
          @click="handleShare"
          class="w-full h-14 rounded-2xl bg-emerald-600 text-white font-semibold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition"
        >
          <Share2 class="w-5 h-5" />
          Share PDF
        </button>

        <!-- NEW TRANSACTION -->
        <button
          @click="handleNewTransaction"
          class="w-full h-14 rounded-2xl border bg-white text-slate-700 font-semibold text-lg active:scale-[0.98] transition"
        >
          Lanjut Transaksi
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  body {
    background: white !important;
  }
}
</style>
