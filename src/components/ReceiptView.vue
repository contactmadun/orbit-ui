<script setup>
import { computed, ref, onMounted } from "vue";
import * as htmlToImage from "html-to-image";
import { useRouter, useRoute } from "vue-router";
import {
  Printer,
  Share2,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-vue-next";

import api from "@/axios";

const router = useRouter();
const route = useRoute();
const receiptRef = ref(null);
const loading = ref(true);
const receipt = ref(null);
const sharing = ref(false);
const saleId = route.params.id;

const fetchReceipt = async () => {
  try {
    loading.value = true;

    const res = await api.get(`/sale/${saleId}`);

    receipt.value = res.data.data;
  } catch (err) {
    console.error(err);

    alert(err?.response?.data?.message || "Gagal mengambil data transaksi");

    router.replace("/pos/transaction");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchReceipt();
});

const formatCurrency = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val || 0);

const totalQty = computed(() => {
  if (!receipt.value?.items) return 0;

  return receipt.value.items.reduce((sum, i) => sum + Number(i.qty), 0);
});

const paymentMethod = computed(() => {
  return (
    receipt.value?.paymentAccount?.type || receipt.value?.paymentMethod || "-"
  );
});

const createdAt = computed(() => {
  if (!receipt.value?.createdAt) return "-";

  return new Date(receipt.value.createdAt).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
});

const handlePrint = () => {
  window.print();
};

const handleNewTransaction = () => {
  router.replace("/pos/transaction");
};

const handleShare = async () => {
  sharing.value = true;

  try {
    if (!receiptRef.value) return;

    const dataUrl = await htmlToImage.toPng(receiptRef.value, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    // convert base64 -> file
    const res = await fetch(dataUrl);

    const blob = await res.blob();

    const file = new File([blob], `receipt-${receipt.value?.trxId}.png`, {
      type: "image/png",
    });

    // share image
    if (
      navigator.canShare &&
      navigator.canShare({
        files: [file],
      })
    ) {
      await navigator.share({
        files: [file],
        title: "Struk Pembayaran",
        text: `Struk ${receipt.value?.trxId}`,
      });
    } else {
      // fallback download
      const link = document.createElement("a");

      link.href = dataUrl;

      link.download = `receipt-${receipt.value?.trxId}.png`;

      link.click();
    }
  } catch (err) {
    console.error(err);

    alert("Gagal membagikan struk");
  } finally {
    sharing.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <!-- HEADER -->
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
          {{ receipt?.trxId || "Loading..." }}
        </p>
      </div>

      <div class="w-10"></div>
    </div>

    <!-- LOADING -->
    <div
      v-if="loading"
      class="min-h-[70vh] flex flex-col items-center justify-center"
    >
      <div
        class="w-16 h-16 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"
      ></div>

      <p class="mt-5 text-sm text-slate-500">Memuat detail transaksi...</p>
    </div>

    <!-- CONTENT -->
    <template v-else-if="receipt">
      <div class="max-w-md mx-auto px-4 py-5 pb-40 mb-20">
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

        <!-- RECEIPT -->
        <div
          ref="receiptRef"
          class="bg-white rounded-[28px] shadow-sm border overflow-hidden print:shadow-none print:border-none"
        >
          <!-- STORE -->
          <div class="px-6 pt-7 pb-5 text-center border-b border-dashed">
            <h2 class="text-xl font-bold text-slate-900">
              {{ receipt?.tenant?.name || "Orbit POS" }}
            </h2>

            <p class="mt-3 text-sm text-slate-500 leading-6">
              {{ receipt?.outlet?.outletName || "-" }}
            </p>
          </div>

          <!-- INFO -->
          <div class="px-6 py-5 border-b border-dashed space-y-3 text-sm">
            <div class="flex items-start justify-between gap-4">
              <span class="text-slate-500">No. Transaksi</span>

              <span class="font-semibold text-right text-slate-800">
                {{ receipt.trxId }}
              </span>
            </div>

            <div class="flex items-center justify-between gap-4">
              <span class="text-slate-500">Tanggal</span>

              <span class="text-slate-800">
                {{ createdAt }}
              </span>
            </div>

            <div class="flex items-center justify-between gap-4">
              <span class="text-slate-500">Status</span>

              <span
                class="capitalize px-2 py-1 rounded-lg text-xs font-semibold"
                :class="
                  receipt.status === 'paid'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-orange-100 text-orange-700'
                "
              >
                {{ receipt.status === "paid" ? "Lunas" : "Belum Lunas" }}
              </span>
            </div>

            <div class="flex items-center justify-between gap-4">
              <span class="text-slate-500">Metode</span>

              <span class="capitalize text-slate-800">
                {{ paymentMethod }}
              </span>
            </div>

            <div
              v-if="receipt.customerName"
              class="flex items-center justify-between gap-4"
            >
              <span class="text-slate-500">Pelanggan</span>

              <span class="text-slate-800">
                {{ receipt.customerName }}
              </span>
            </div>
          </div>

          <!-- ITEMS -->
          <div class="px-6 py-5">
            <div
              class="grid grid-cols-12 gap-2 pb-3 border-b text-sm font-semibold text-slate-700"
            >
              <div class="col-span-6">Item</div>

              <div class="col-span-2 text-center">Qty</div>

              <div class="col-span-4 text-right">Subtotal</div>
            </div>

            <div class="divide-y">
              <div
                v-for="item in receipt.items"
                :key="item.id"
                class="grid grid-cols-12 gap-2 py-4"
              >
                <div class="col-span-6 min-w-0">
                  <p class="font-semibold text-slate-800 leading-5">
                    {{ item.productName }}
                  </p>

                  <p class="text-xs text-slate-500 mt-1">
                    {{ formatCurrency(item.sellPrice) }}
                  </p>
                </div>

                <div
                  class="col-span-2 flex items-start justify-center font-medium text-slate-700"
                >
                  {{ item.qty }}
                </div>

                <div class="col-span-4 text-right font-semibold text-slate-800">
                  {{ formatCurrency(item.totalPrice) }}
                </div>
              </div>
            </div>
          </div>

          <!-- TOTAL -->
          <div class="px-6 py-5 border-t border-dashed space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-slate-500"> {{ totalQty }} item </span>

              <span class="text-3xl font-bold text-blue-700">
                {{ formatCurrency(receipt.totalAmount) }}
              </span>
            </div>

            <div class="space-y-2 pt-1">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Bayar</span>

                <span class="text-lg text-slate-800">
                  {{ formatCurrency(receipt.amountPaid) }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-slate-500">Kembalian</span>

                <span class="text-xl font-bold text-emerald-600">
                  {{ formatCurrency(receipt.changeAmount) }}
                </span>
              </div>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="px-6 py-7 border-t border-dashed text-center">
            <h3 class="text-xl font-semibold text-slate-800">
              Terima kasih 🙌
            </h3>

            <p class="text-slate-500 mt-4 leading-7 max-w-[260px] mx-auto">
              Barang yang sudah dibeli tidak dapat ditukar/dikembalikan
            </p>
          </div>
        </div>
      </div>

      <!-- ACTION -->
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
            :disabled="sharing"
            @click="handleShare"
            class="w-full h-14 rounded-2xl bg-emerald-600 text-white font-semibold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition"
          >
            <Loader2 v-if="sharing" class="w-5 h-5 animate-spin" />
            <Share2 v-else class="w-5 h-5" />
            Share
          </button>

          <!-- NEW -->
          <button
            @click="handleNewTransaction"
            class="w-full h-14 rounded-2xl border bg-white text-slate-700 font-semibold text-lg active:scale-[0.98] transition"
          >
            Lanjut Transaksi
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
@media print {
  body {
    background: white !important;
  }
}
</style>
