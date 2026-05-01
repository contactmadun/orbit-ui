<script setup>
import api from "../axios";
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/user";

import { Package, AlertTriangle, Tags, BadgePercent } from "lucide-vue-next";

const CHART_HEIGHT_PX = 192;
const totalProduct = ref();
const totalCategory = ref();
const totalBrand = ref();
const latestProducts = ref([]);
const loadingProducts = ref(false);

// --- DATA KATEGORI ---
const categories = ref([
  { name: "Voucher", value: 150 },
  { name: "Kartu", value: 90 },
  { name: "Aksesoris", value: 300 },
  { name: "Pulsa", value: 100 },
  { name: "Data", value: 80 },
  { name: "Lainnya", value: 50 },
]);

const fetchLatestProducts = async () => {
  loadingProducts.value = true;
  try {
    const res = await api.get("/products/latest");

    latestProducts.value = res.data.data;
  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(() => {
      loadingProducts.value = false;
    }, 3000);
  }
};

const fetchStats = async () => {
  try {
    const res = await api.get("/stats");

    totalProduct.value = res.data.data.totalProduct;
    totalCategory.value = res.data.data.totalCategory;
    totalBrand.value = res.data.data.totalBrand;
    console.log(res.data);
  } catch (err) {
    console.error(err);
  }
};

// --- PROPS ---
const props = defineProps({
  sales: { type: Number, default: 2500 },
  expenses: { type: Number, default: 360 },
  oos: { type: Number, default: 125 },
});

onMounted(() => {
  fetchStats();
  fetchLatestProducts();
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    <!-- Total Product -->
    <div
      class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
    >
      <div class="flex gap-2 items-center mb-2">
        <div
          class="w-8 h-8 bg-slate-100 text-blue-900 rounded-lg flex items-center justify-center"
        >
          <Package class="w-4 h-4" />
        </div>
        <p class="text-base font-semibold text-slate-800">Total Product</p>
      </div>

      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <h2 class="text-2xl text-slate-800 font-bold">{{ totalProduct }}</h2>
          <p class="text-xs text-green-600 font-medium">+15.9%</p>
        </div>

        <!-- Sparkline -->
        <svg viewBox="0 0 100 30" class="w-20 h-8">
          <polyline
            fill="none"
            stroke="#16a34a"
            stroke-width="2"
            points="0,20 15,18 30,15 45,17 60,10 75,12 90,6 100,8"
          />
        </svg>
      </div>

      <p class="text-sm text-slate-600">
        Total produk aktif yang tersedia di sistem.
      </p>
    </div>

    <!-- Stok Menipis -->
    <div
      class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
    >
      <div class="flex gap-2 items-center mb-2">
        <div
          class="w-8 h-8 bg-slate-100 text-amber-700 rounded-lg flex items-center justify-center"
        >
          <AlertTriangle class="w-4 h-4" />
        </div>
        <p class="text-base font-semibold text-slate-800">Stok Menipis</p>
      </div>

      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <h2 class="text-2xl text-slate-800 font-bold">24</h2>
          <p class="text-xs text-red-600 font-medium">-21.9%</p>
        </div>

        <!-- Sparkline -->
        <svg viewBox="0 0 100 30" class="w-20 h-8">
          <polyline
            fill="none"
            stroke="#dc2626"
            stroke-width="2"
            points="0,20 15,18 30,15 45,17 60,10 75,12 90,6 100,8"
          />
        </svg>
      </div>

      <p class="text-sm text-slate-600">
        Produk dengan stok di bawah batas minimum.
      </p>
    </div>

    <!-- Total Kategori -->
    <div
      class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
    >
      <div class="flex gap-2 items-center mb-2">
        <div
          class="w-8 h-8 bg-slate-100 text-purple-700 rounded-lg flex items-center justify-center"
        >
          <Tags class="w-4 h-4" />
        </div>
        <p class="text-base font-semibold text-slate-800">Total Kategori</p>
      </div>

      <div class="flex items-center mb-2 gap-2">
        <h2 class="text-2xl text-slate-800 font-bold">{{ totalCategory }}</h2>
      </div>

      <p class="text-sm text-slate-600">Kategori produk yang telah dibuat.</p>
    </div>

    <!-- Total Brand -->
    <div
      class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
    >
      <div class="flex gap-2 items-center mb-2">
        <div
          class="w-8 h-8 bg-slate-100 text-emerald-700 rounded-lg flex items-center justify-center"
        >
          <BadgePercent class="w-4 h-4" />
        </div>
        <p class="text-base font-semibold text-slate-800">Total Brand</p>
      </div>

      <div class="flex items-center mb-2 gap-2">
        <h2 class="text-2xl text-slate-800 font-bold">{{ totalBrand }}</h2>
      </div>

      <p class="text-sm text-slate-600">
        Brand produk yang terdaftar di sistem.
      </p>
    </div>
  </div>

  <!-- metric -->
  <!-- Widget Dashboard -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Produk Out of Stock -->
    <div class="bg-white border border-slate-200 rounded-xl p-5">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="text-lg font-semibold text-slate-800">
            Produk Out of Stock
          </h3>
          <p class="text-sm text-slate-500">Statistik 8 bulan terakhir</p>
        </div>
      </div>

      <div class="flex items-end justify-between h-40 gap-3">
        <div class="relative flex flex-col items-center group">
          <!-- Tooltip -->
          <div
            class="absolute -top-10 opacity-0 group-hover:opacity-100 transition text-xs bg-slate-800 text-white px-2 py-1 rounded shadow"
          >
            12 Produk
          </div>
          <!-- Bar -->
          <div
            class="w-6 bg-slate-300 rounded-md h-16 transition-all duration-300 group-hover:h-20 group-hover:bg-blue-500"
          ></div>
          <span class="text-xs text-slate-500 mt-2">Jul</span>
        </div>

        <div class="relative flex flex-col items-center group">
          <div
            class="absolute -top-10 opacity-0 group-hover:opacity-100 transition text-xs bg-slate-800 text-white px-2 py-1 rounded shadow"
          >
            20 Produk
          </div>
          <div
            class="w-6 bg-slate-300 rounded-md h-24 transition-all duration-300 group-hover:h-28 group-hover:bg-blue-500"
          ></div>
          <span class="text-xs text-slate-500 mt-2">Agu</span>
        </div>

        <div class="flex flex-col items-center gap-2">
          <div class="w-6 bg-slate-300 rounded-md h-32"></div>
          <span class="text-xs text-slate-500">Sep</span>
        </div>

        <div class="flex flex-col items-center gap-2">
          <div class="w-6 bg-slate-300 rounded-md h-20"></div>
          <span class="text-xs text-slate-500">Okt</span>
        </div>

        <div class="flex flex-col items-center gap-2">
          <div class="w-6 bg-slate-300 rounded-md h-28"></div>
          <span class="text-xs text-slate-500">Nov</span>
        </div>

        <div class="flex flex-col items-center gap-2">
          <div class="w-6 bg-blue-500 rounded-md h-40"></div>
          <span class="text-xs text-slate-500">Des</span>
        </div>

        <div class="flex flex-col items-center gap-2">
          <div class="w-6 bg-slate-300 rounded-md h-28"></div>
          <span class="text-xs text-slate-500">Jan</span>
        </div>

        <div class="flex flex-col items-center gap-2">
          <div class="w-6 bg-slate-300 rounded-md h-36"></div>
          <span class="text-xs text-slate-500">Feb</span>
        </div>
      </div>
    </div>

    <!-- Distribusi Produk per Kategori -->
    <div class="bg-white border border-slate-200 rounded-xl p-5">
      <h3 class="text-lg font-semibold text-slate-800 mb-4">
        Statistik Produk Per Kategori
      </h3>

      <div class="space-y-4">
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span>Voucher Kuota</span>
            <span>45%</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full w-[45%]"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-sm mb-1">
            <span>Aksesori</span>
            <span>30%</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-2">
            <div class="bg-emerald-500 h-2 rounded-full w-[30%]"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-sm mb-1">
            <span>Digital Produk</span>
            <span>15%</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-2">
            <div class="bg-purple-500 h-2 rounded-full w-[15%]"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-sm mb-1">
            <span>Lainnya</span>
            <span>10%</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-2">
            <div class="bg-amber-500 h-2 rounded-full w-[10%]"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Tables Section -->
  <!-- Full Table - Produk Terakhir -->
  <div class="bg-white border border-slate-200 rounded-xl p-6">
    <div class="flex justify-between items-center mb-5">
      <div>
        <h3 class="text-lg font-semibold text-slate-800">
          Produk Terakhir Ditambahkan
        </h3>
        <p class="text-sm text-slate-500">
          5 produk terbaru yang masuk ke sistem
        </p>
      </div>

      <RouterLink
        to="/product/list-product"
        class="text-sm text-blue-900 hover:underline"
        >Lihat Semua</RouterLink
      >
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-500 border-b">
            <th class="py-3">Produk</th>
            <th>Kategori</th>
            <th>Brand</th>
            <th>Harga</th>
            <th>Stok</th>
            <th>Tanggal Ditambahkan</th>
          </tr>
        </thead>

        <tbody class="divide-y">
          <template v-if="loadingProducts">
            <tr
              v-for="i in 8"
              :key="'skeleton-' + i"
              class="animate-pulse divide-x divide-gray-200"
            >
              <td class="px-3 py-2">
                <div class="h-4 w-24 bg-gray-200 rounded"></div>
              </td>
              <td class="px-3 py-2">
                <div class="h-4 w-24 bg-gray-200 rounded"></div>
              </td>
              <td class="px-3 py-2">
                <div class="h-4 w-24 bg-gray-200 rounded"></div>
              </td>

              <td class="px-3 py-2">
                <div class="h-4 w-40 bg-gray-200 rounded"></div>
              </td>

              <td class="px-3 py-2">
                <div class="h-4 w-48 bg-gray-200 rounded"></div>
              </td>

              <td class="px-3 py-2">
                <div class="h-4 w-24 bg-gray-200 rounded"></div>
              </td>

              <td class="px-3 py-2">
                <div class="h-4 w-24 bg-gray-200 rounded"></div>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr
              v-for="product in latestProducts"
              :key="product.id"
              class="hover:bg-slate-50"
            >
              <td class="py-3 font-medium text-slate-800">
                {{ product.productName }}
              </td>

              <td>
                {{ product.categorie?.name }}
              </td>

              <td>
                {{ product.brand?.name }}
              </td>

              <td>
                Rp {{ Number(product.retailPrice).toLocaleString("id-ID") }}
              </td>

              <td class="text-slate-700">-</td>

              <td>
                {{
                  new Date(product.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                }}
              </td>
            </tr>
          </template>

          <tr v-if="latestProducts.length === 0">
            <td colspan="6" class="text-center py-6 text-slate-400">
              Belum ada produk
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
