<script setup>
import { ref, watch } from "vue";
import api from "@/axios";
import BaseOverlay from "./BaseOverlay.vue";

import {
  Package,
  Tag,
  Barcode,
  DollarSign,
  Layers,
  Calendar,
  Info,
  Store,
  FileText,
  AlertCircle,
} from "lucide-vue-next";

const props = defineProps({
  show: Boolean,
  productId: Number,
});

const emit = defineEmits(["close"]);

const product = ref(null);
const stocks = ref([]);
const loading = ref(false);

const fetchProduct = async () => {
  if (!props.productId) return;

  loading.value = true;

  try {
    const res = await api.get(`/products/${props.productId}`);
    product.value = res.data.data;
  } catch (err) {
    console.error(err);
  }

  loading.value = false;
};

const fetchStocks = async () => {
  if (!props.productId) return;

  try {
    const res = await api.get(`/stocks/${props.productId}`);
    stocks.value = res.data.data || [];
  } catch (err) {
    console.error(err);
  }
};

watch(
  () => props.show,
  (v) => {
    if (v) {
      fetchProduct();
      fetchStocks();
    }
  },
);
</script>

<template>
  <BaseOverlay :show="show" @close="emit('close')" />

  <transition name="slide">
    <div
      v-if="show"
      class="fixed top-0 right-0 z-[9999] h-full w-[420px] bg-white border-l border-slate-200 shadow-xl flex flex-col"
    >
      <!-- HEADER -->
      <div
        class="px-6 py-4 border-b bg-white flex justify-between items-center"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-blue-50 text-blue-700">
            <Package class="w-5 h-5" />
          </div>

          <div>
            <h2 class="text-sm text-slate-500">Product Detail</h2>
            <p class="font-semibold text-slate-800">
              {{ product?.productName || "Loading..." }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="emit('close')"
            class="p-2 hover:bg-slate-100 rounded-md text-slate-400"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- CONTENT -->
      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <!-- LOADING -->
        <div v-if="loading" class="text-center py-10 text-slate-400">
          Loading product...
        </div>

        <template v-if="product">
          <!-- BASIC INFO -->
          <div class="space-y-4">
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2 text-slate-500">
                <Info class="w-4 h-4" />
                Status
              </div>

              <span
                class="px-2 py-1 text-xs rounded-md font-medium"
                :class="
                  product.status === 'active'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                "
              >
                {{ product.status }}
              </span>
            </div>

            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2 text-slate-500">
                <Barcode class="w-4 h-4" />
                SKU
              </div>

              <span class="font-medium text-slate-800">
                {{ product.sku || "-" }}
              </span>
            </div>

            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2 text-slate-500">
                <Tag class="w-4 h-4" />
                Category
              </div>

              <span class="font-medium text-slate-800">
                {{ product.categorie?.name || "-" }}
              </span>
            </div>

            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2 text-slate-500">
                <Store class="w-4 h-4" />
                Brand
              </div>

              <span class="font-medium text-slate-800">
                {{ product.brand?.name || "-" }}
              </span>
            </div>
          </div>

          <!-- DESCRIPTION -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm text-slate-600">
              <FileText class="w-4 h-4" />
              Deskripsi
            </div>

            <textarea
              disabled
              rows="4"
              class="w-full text-sm rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 resize-none"
              :value="product.description || 'Tidak ada deskripsi'"
            />
          </div>

          <!-- PRICE CARD -->
          <div class="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign class="w-4 h-4" />
            Informasi Harga
          </div>
          <div class="border rounded-lg p-4 -mt-4 bg-slate-50 space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Harga Modal</span>
              <span class="font-medium">
                Rp {{ Number(product.costPrice).toLocaleString("id-ID") }}
              </span>
            </div>

            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Harga Retail</span>
              <span class="font-semibold text-blue-700">
                Rp {{ Number(product.retailPrice).toLocaleString("id-ID") }}
              </span>
            </div>

            <div
              v-if="product.wholesalePrice"
              class="flex justify-between text-sm"
            >
              <span class="text-slate-500">Harga Grosir</span>
              <span class="font-medium">
                Rp {{ Number(product.wholesalePrice).toLocaleString("id-ID") }}
              </span>
            </div>
          </div>

          <!-- STOCK INFO -->
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-sm text-slate-600">
              <Layers class="w-4 h-4" />
              Informasi Stok
            </div>

            <!-- STOCK META -->
            <div class="border rounded-lg p-4 bg-slate-50 space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500">Tipe Produk</span>
                <span class="font-medium text-slate-800 capitalize">
                  {{ product.typeProduct || "-" }}
                </span>
              </div>

              <div class="flex justify-between">
                <span class="text-slate-500">Minimum Stok</span>
                <span class="font-medium text-slate-800">
                  {{ product.minimumStok ?? "-" }}
                </span>
              </div>
            </div>

            <!-- STOCK LIST -->
            <div
              v-if="stocks.length"
              class="border rounded-lg divide-y bg-white"
            >
              <div
                v-for="stock in stocks"
                :key="stock.outletId"
                class="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div class="flex items-center gap-2 text-slate-600">
                  <Store class="w-4 h-4" />
                  {{ stock.Outlet?.name || "Outlet" }}
                </div>

                <span
                  class="font-semibold"
                  :class="
                    stock.stock === 0
                      ? 'text-red-600'
                      : stock.stock <= product.minimumStok
                        ? 'text-yellow-600'
                        : 'text-slate-800'
                  "
                >
                  {{ stock.stock }}
                </span>
              </div>
            </div>

            <!-- EMPTY STATE -->
            <div
              v-else
              class="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center bg-slate-50"
            >
              <AlertCircle class="w-6 h-6 text-slate-400 mx-auto mb-2" />

              <p class="text-sm text-slate-600 font-medium">
                Stok belum diinisialisasi
              </p>

              <p class="text-xs text-slate-400 mt-1">
                Tambahkan stok pada outlet untuk mulai mengelola inventori
                produk ini
              </p>
            </div>
          </div>

          <!-- META -->
          <div class="border-t pt-4 text-xs text-slate-400 space-y-1">
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4" />
              Dibuat:
              {{ new Date(product.createdAt).toLocaleDateString("id-ID") }}
            </div>

            <div>
              Update terakhir:
              {{ new Date(product.updatedAt).toLocaleDateString("id-ID") }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
