<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import api from "@/axios";

import {
  Package,
  TrendingUp,
  AlertTriangle,
  Truck,
  DollarSign,
  ArrowLeft,
  ArrowUpRight,
} from "lucide-vue-next";
import router from "@/router";

const route = useRoute();
const productId = route.params.productId;
const outletId = route.params.outletId;
const stockSparkline = [30, 45, 40, 60, 55, 70, 65];
const loading = ref(true);

const product = ref({});
const stock = ref(null);
const movements = ref([]);

const stockInfo = computed(() => {
  return {
    currentStock: stock.value?.stock || 0,
    minStock: product.value?.minimumStok || 0,
    incomingStock: 0,
  };
});

/* sales last 7 days */
const sales = [
  { label: "10 Jun", total: 8, lastWeek: 15 },
  { label: "11 Jun", total: 12, lastWeek: 20 },
  { label: "12 Jun", total: 6, lastWeek: 12 },
  { label: "13 Jun", total: 14, lastWeek: 28 },
  { label: "14 Jun", total: 9, lastWeek: 8 },
  { label: "15 Jun", total: 40, lastWeek: 10 },
  { label: "16 Jun", total: 21, lastWeek: 5 },
];

const revenue = [
  { label: "Mon", value: 120000 },
  { label: "Tue", value: 210000 },
  { label: "Wed", value: 160000 },
  { label: "Thu", value: 280000 },
  { label: "Fri", value: 190000 },
  { label: "Sat", value: 320000 },
  { label: "Sun", value: 290000 },
];

const totalSales = sales.reduce((a, b) => a + b.total, 0);
const totalRevenue = revenue.reduce((a, b) => a + b.value, 0);

const maxRevenue = Math.max(...revenue.map((r) => r.value));

const revenuePoints = revenue
  .map((r, i) => {
    const x = i * 45;
    const y = 100 - (r.value / maxRevenue) * 80;
    return `${x},${y}`;
  })
  .join(" ");

const revenueArea = `0,100 ${revenuePoints} ${revenue.length * 45},100`;

const fetchDetail = async () => {
  try {
    const res = await api.get(`/stocks/detail/${productId}/${outletId}`);

    product.value = res.data.data.product;
    console.log(product.value);
    stock.value = res.data.data.stock;
    movements.value = res.data.data.movements;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDetail);
</script>

<template>
  <div class="space-y-6">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <router-link to="/product/stock">
          <button class="p-2 border rounded-lg hover:bg-gray-50">
            <ArrowLeft class="w-4 h-4" />
          </button>
        </router-link>

        <div>
          <h1 class="text-2xl font-semibold">
            {{ product.productName }}
          </h1>
          <p class="text-sm text-gray-500">SKU {{ product.sku }}</p>
        </div>
      </div>
    </div>

    <!-- PRODUCT INFO -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- PRODUCT -->
      <div class="bg-white border rounded-xl p-5 hover:shadow-sm transition">
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-sm text-gray-500 mb-1">Type Product</p>
            <p class="font-semibold text-lg leading-tight capitalize">
              {{ product.typeProduct }}
            </p>
          </div>

          <div
            class="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50"
          >
            <Package class="w-4 h-4 text-blue-600" />
          </div>
        </div>

        <p class="text-sm text-gray-500">
          Available at outlet
          <span class="font-medium">{{ product.outlet }}</span>
        </p>
      </div>

      <!-- RETAIL PRICE -->
      <div class="bg-white border rounded-xl p-5 hover:shadow-sm transition">
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-sm text-gray-500">Retail Price</p>
            <p class="font-semibold text-lg">
              Rp {{ Number(product.retailPrice).toLocaleString() }}
            </p>
          </div>

          <div
            class="w-9 h-9 flex items-center justify-center rounded-lg bg-green-50"
          >
            <DollarSign class="w-4 h-4 text-green-600" />
          </div>
        </div>

        <p class="text-sm text-gray-500">Selling price set for customers</p>
      </div>

      <!-- COST PRICE -->
      <div class="bg-white border rounded-xl p-5 hover:shadow-sm transition">
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-sm text-gray-500">Cost Price</p>
            <p class="font-semibold text-lg">
              Rp {{ Number(product.costPrice).toLocaleString() }}
            </p>
          </div>

          <div
            class="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100"
          >
            <DollarSign class="w-4 h-4 text-gray-600" />
          </div>
        </div>

        <p class="text-sm text-gray-500">Purchase price from supplier</p>
      </div>

      <!-- MARGIN -->
      <div class="bg-white border rounded-xl p-5 hover:shadow-sm transition">
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-sm text-gray-500">Margin</p>

            <div class="flex items-center gap-2">
              <p
                class="font-semibold text-lg"
                :class="
                  product.retailPrice - product.costPrice >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                Rp
                {{
                  Number(
                    product.retailPrice - product.costPrice,
                  ).toLocaleString()
                }}
              </p>

              <span
                class="text-sm font-medium"
                :class="
                  product.retailPrice - product.costPrice >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                (
                {{
                  (
                    ((product.retailPrice - product.costPrice) /
                      product.retailPrice) *
                    100
                  ).toFixed(1)
                }}%)
              </span>
            </div>
          </div>

          <div
            class="w-9 h-9 flex items-center justify-center rounded-lg bg-purple-50"
          >
            <TrendingUp class="w-4 h-4 text-purple-600" />
          </div>
        </div>

        <p class="text-sm text-gray-500">Profit per item sold</p>
      </div>
    </div>

    <!-- STOCK OVERVIEW -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- CURRENT STOCK -->
      <div
        class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-sm text-gray-500">Current Stock</p>

            <p class="text-2xl font-bold text-slate-800">
              {{ stockInfo.currentStock }}
            </p>
          </div>

          <div
            class="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50"
          >
            <Package class="w-4 h-4 text-blue-600" />
          </div>
        </div>

        <!-- SPARKLINE -->
        <div class="h-8 flex items-end gap-[3px] mb-2">
          <div
            v-for="(point, i) in stockSparkline"
            :key="i"
            class="flex-1 bg-blue-200 rounded-sm"
            :style="{ height: point + '%' }"
          ></div>
        </div>

        <p class="text-sm text-gray-500">Total stok yang tersedia saat ini.</p>
      </div>

      <!-- MINIMUM STOCK -->
      <div
        class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-sm text-gray-500">Minimum Stock</p>

            <p
              class="text-2xl font-bold"
              :class="
                stockInfo.currentStock <= stockInfo.minStock
                  ? 'text-amber-600'
                  : 'text-slate-800'
              "
            >
              {{ stockInfo.minStock }}
            </p>
          </div>

          <div
            class="w-9 h-9 flex items-center justify-center rounded-lg bg-amber-50"
          >
            <AlertTriangle class="w-4 h-4 text-amber-600" />
          </div>
        </div>

        <p class="text-sm text-gray-500">
          Batas minimal stok sebelum perlu restock.
        </p>
      </div>

      <!-- INCOMING STOCK -->
      <div
        class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-sm text-gray-500">Incoming Stock</p>

            <p class="text-2xl font-bold text-slate-500">
              {{ stockInfo.incomingStock }}
            </p>
          </div>

          <div
            class="w-9 h-9 flex items-center justify-center rounded-lg bg-purple-50"
          >
            <Truck class="w-4 h-4 text-purple-600" />
          </div>
        </div>

        <p class="text-sm text-gray-500">
          Stok yang sedang dalam proses masuk.
        </p>
      </div>
    </div>

    <!-- SALES & REVENUE ANALYTICS -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- SALES PERFORMANCE -->
      <div class="lg:col-span-3 bg-white border rounded-xl p-6 flex flex-col">
        <!-- HEADER -->
        <div class="flex items-center gap-4">
          <div class="p-3 bg-slate-50 border rounded-2xl border-slate-100">
            <TrendingUp class="w-5 h-5 text-blue-900" />
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              Sales Performance
            </h3>
            <p class="text-sm text-slate-500">
              Penjualan produk 7 hari terakhir
            </p>
          </div>
        </div>

        <!-- CONTENT didorong ke bawah -->
        <div class="flex-1 flex items-end">
          <div
            style="
              display: grid;
              grid-template-columns: 1fr 3fr;
              gap: 16px;
              align-items: end;
              width: 100%;
            "
          >
            <!-- SUMMARY -->
            <div style="display: flex; flex-direction: column">
              <p class="text-sm text-gray-500 mb-1">Total Terjual</p>
              <p class="text-3xl font-bold text-gray-900">{{ totalSales }}</p>
              <p class="text-xs text-gray-500">pcs minggu ini</p>
            </div>

            <!-- BAR CHART -->
            <div>
              <div
                style="
                  display: flex;
                  align-items: flex-end;
                  gap: 4px;
                  height: 110px;
                "
              >
                <div
                  v-for="day in sales"
                  :key="day.label"
                  class="flex-1 flex justify-center"
                >
                  <div
                    style="
                      position: relative;
                      display: flex;
                      align-items: flex-end;
                      width: 100%;
                      justify-content: center;
                    "
                  >
                    <div
                      class="bg-slate-200 rounded w-9 absolute bottom-0"
                      :style="{ height: day.lastWeek * 5 + 'px' }"
                    />
                    <div
                      class="bg-blue-700 rounded w-9 relative"
                      :style="{ height: day.total * 5 + 'px' }"
                    />
                  </div>
                </div>
              </div>
              <div style="display: flex; gap: 4px; margin-top: 8px">
                <div
                  v-for="day in sales"
                  :key="day.label + '-label'"
                  class="flex-1 flex justify-center"
                >
                  <span class="text-xs text-gray-500">{{ day.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- REVENUE -->
      <div class="lg:col-span-2 bg-white border rounded-xl p-6 space-y-5">
        <!-- HEADER -->
        <div class="flex items-center gap-4">
          <div class="p-3 bg-slate-50 border rounded-2xl border-slate-100">
            <DollarSign class="w-5 h-5 text-purple-900" />
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900">Revenue</h3>
            <p class="text-sm text-slate-500">Pendapatan 7 hari terakhir</p>
          </div>
        </div>

        <!-- TOTAL -->
        <div>
          <p class="text-2xl font-bold text-gray-900">
            Rp {{ totalRevenue.toLocaleString() }}
          </p>

          <p class="text-xs text-gray-500">Total revenue minggu ini</p>
        </div>

        <!-- LINE CHART -->
        <svg viewBox="0 0 240 100" class="w-full h-28">
          <!-- AREA -->
          <polyline
            fill="rgba(99,102,241,0.15)"
            stroke="none"
            :points="revenueArea"
          />

          <!-- LINE -->
          <polyline
            fill="none"
            stroke="#6366F1"
            stroke-width="2"
            :points="revenuePoints"
          />
        </svg>

        <!-- DATE -->
        <div class="flex justify-between text-xs text-gray-500">
          <span v-for="day in revenue" :key="day.label">
            {{ day.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- STOCK MOVEMENT -->
    <div class="bg-white border rounded-xl p-6 space-y-6">
      <!-- HEADER -->
      <div class="flex items-center justify-between">
        <div class="flex gap-4 items-center">
          <div class="p-3 bg-slate-50 border rounded-2xl border-slate-100">
            <Package class="w-5 h-5 text-blue-900" />
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900">Stock Movement</h3>
            <p class="text-sm text-slate-500">Riwayat perubahan stok produk</p>
          </div>
        </div>

        <div class="flex items-center gap-2 text-sm">
          <button class="px-3 py-1.5 border rounded-lg hover:bg-slate-50">
            Export
          </button>
        </div>
      </div>

      <!-- TABLE -->
      <div class="overflow-x-auto border rounded-lg">
        <table class="w-full text-sm">
          <!-- TABLE HEAD -->
          <thead class="bg-gray-50 text-gray-600 border-b">
            <tr class="text-left">
              <th class="py-3 px-4 w-10 border-r">
                <input type="checkbox" />
              </th>

              <th class="py-3 px-4 border-r">Date</th>
              <th class="py-3 px-4 border-r">Outlet</th>
              <th class="py-3 px-4 border-r">Type</th>

              <th class="py-3 px-4 text-right border-r">Qty</th>

              <th class="py-3 px-4">Reference</th>
            </tr>
          </thead>

          <!-- TABLE BODY -->
          <tbody class="divide-y">
            <tr
              v-for="m in movements"
              :key="m.id"
              class="hover:bg-slate-50 transition"
            >
              <td class="py-3 px-4 border-r">
                <input type="checkbox" />
              </td>

              <td class="py-3 px-4 border-r">
                {{ new Date(m.createdAt).toLocaleDateString() }}
              </td>

              <td class="py-3 px-4 border-r font-medium text-gray-800">
                {{ m.Outlet.name }}
              </td>

              <td class="py-3 px-4 border-r capitalize text-gray-600">
                {{ m.type.replace("_", " ") }}
              </td>

              <td
                class="py-3 px-4 text-right font-semibold border-r"
                :class="m.qty > 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ m.qty > 0 ? "+" + m.qty : m.qty }}
              </td>

              <td class="py-3 px-4 text-gray-500">
                {{ m.reference }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
