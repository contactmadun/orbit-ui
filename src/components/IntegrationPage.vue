<script setup>
import { ref } from "vue";

const selectedRange = ref("7d");
const selectedOutlet = ref("all");

const kpis = [
  { title: "Revenue", value: "Rp 12.500.000", change: "+12%" },
  { title: "Transactions", value: "320", change: "+5%" },
  { title: "Profit", value: "Rp 4.200.000", change: "-3%" },
  { title: "AOV", value: "Rp 39.000", change: "+2%" },
];

const outlets = [
  { name: "Outlet A", revenue: "Rp 5.000.000", trx: 120, growth: "+10%" },
  { name: "Outlet B", revenue: "Rp 4.000.000", trx: 100, growth: "-5%" },
  { name: "Outlet C", revenue: "Rp 3.500.000", trx: 90, growth: "+3%" },
];

const topProducts = [
  { name: "Produk 1", sold: 120 },
  { name: "Produk 2", sold: 95 },
  { name: "Produk 3", sold: 80 },
];

const alerts = ["Outlet B turun 20% hari ini", "Stock Produk 1 hampir habis"];
</script>

<template>
  <div class="p-6 space-y-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Dashboard</h1>

      <div class="flex gap-2">
        <select v-model="selectedRange" class="border rounded px-3 py-2">
          <option value="1d">Hari Ini</option>
          <option value="7d">7 Hari</option>
          <option value="30d">30 Hari</option>
        </select>

        <select v-model="selectedOutlet" class="border rounded px-3 py-2">
          <option value="all">Semua Outlet</option>
          <option value="a">Outlet A</option>
          <option value="b">Outlet B</option>
        </select>
      </div>
    </div>

    <!-- KPI -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div
        v-for="kpi in kpis"
        :key="kpi.title"
        class="bg-white p-4 rounded-2xl shadow"
      >
        <p class="text-gray-500 text-sm">{{ kpi.title }}</p>
        <h2 class="text-xl font-bold">{{ kpi.value }}</h2>
        <p
          :class="kpi.change.includes('-') ? 'text-red-500' : 'text-green-500'"
          class="text-sm"
        >
          {{ kpi.change }}
        </p>
      </div>
    </div>

    <!-- Chart + Outlet -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Chart -->
      <div class="bg-white p-4 rounded-2xl shadow col-span-2">
        <h3 class="font-semibold mb-2">Revenue Trend</h3>
        <div class="h-64 flex items-center justify-center text-gray-400">
          Chart Placeholder
        </div>
      </div>

      <!-- Outlet Performance -->
      <div class="bg-white p-4 rounded-2xl shadow">
        <h3 class="font-semibold mb-2">Outlet Performance</h3>
        <div class="space-y-3">
          <div
            v-for="outlet in outlets"
            :key="outlet.name"
            class="flex justify-between items-center border-b pb-2"
          >
            <div>
              <p class="font-medium">{{ outlet.name }}</p>
              <p class="text-sm text-gray-500">{{ outlet.trx }} trx</p>
            </div>
            <div class="text-right">
              <p class="font-semibold">{{ outlet.revenue }}</p>
              <p
                :class="
                  outlet.growth.includes('-')
                    ? 'text-red-500'
                    : 'text-green-500'
                "
                class="text-sm"
              >
                {{ outlet.growth }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerts + Top Products -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Alerts -->
      <div class="bg-white p-4 rounded-2xl shadow">
        <h3 class="font-semibold mb-2">Insights & Alerts</h3>
        <ul class="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li v-for="(alert, i) in alerts" :key="i">
            {{ alert }}
          </li>
        </ul>
      </div>

      <!-- Top Products -->
      <div class="bg-white p-4 rounded-2xl shadow">
        <h3 class="font-semibold mb-2">Top Products</h3>
        <div class="space-y-3">
          <div
            v-for="product in topProducts"
            :key="product.name"
            class="flex justify-between border-b pb-2"
          >
            <p>{{ product.name }}</p>
            <p class="font-medium">{{ product.sold }} sold</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Payment -->
      <div class="bg-white p-4 rounded-2xl shadow">
        <h3 class="font-semibold mb-2">Payment Methods</h3>
        <div class="h-40 flex items-center justify-center text-gray-400">
          Pie Chart Placeholder
        </div>
      </div>

      <!-- Staff -->
      <div class="bg-white p-4 rounded-2xl shadow">
        <h3 class="font-semibold mb-2">Staff Activity</h3>
        <div class="h-40 flex items-center justify-center text-gray-400">
          Activity Placeholder
        </div>
      </div>
    </div>
  </div>
</template>
