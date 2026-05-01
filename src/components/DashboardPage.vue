<script setup>
import { ref, onMounted, watch, computed } from "vue";
import api from "@/axios";
import DashboardLayout from "@/components/reusable/DashboardLayout.vue";
import { useUserStore } from "@/stores";
import { Wallet, ArrowLeftRight, ArrowUpRight } from "lucide-vue-next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const userStore = useUserStore();
const profitToday = ref(0);
const totalRevenue = ref(0);
const totalTransactions = ref(0);
const hasPendingSubscription = ref(false);
const outletFilter = ref("all");
const dateRange = ref("today"); // default
const revenueChart = ref([]);
const chartLoading = ref(false);
const animated = ref(false);
const insights = ref([]);
const topOutlets = ref([]);
const activities = ref([]);

const apt = computed(() => {
  if (!totalTransactions.value) return 0;
  return profitToday.value / totalTransactions.value;
});

function formatInsight(item) {
  if (!item) return null;

  // 🔥 BEST SELLER
  if (item.type === "best_seller") {
    return {
      text: `🔥 ${item.product_name} mendominasi penjualan (${item.total_trx} trx)`,
    };
  }

  // ⚠️ LOW APT
  if (item.type === "low_apt") {
    return {
      text: `⚠️ Profit per transaksi masih rendah, pertimbangkan upselling`,
    };
  }

  // 📈 GENERIC
  return {
    text: `📊 ${item.message}`,
  };
}

const aptInsight = computed(() => {
  if (!totalTransactions.value) return "Belum cukup data";

  if (apt.value >= 5000) {
    return "Profit per transaksi sudah sesuai target 👍";
  } else if (apt.value >= 3000) {
    return "Sudah cukup baik, tapi masih bisa ditingkatkan.";
  } else {
    return "Perlu fokus upselling produk margin tinggi.";
  }
});

/* outlet list */
const outlets = ref([{ id: "all", name: "Semua Outlet" }]);

const dateRangeLabel = computed(() => {
  if (dateRange.value === "today") return "hari ini";
  if (dateRange.value === "7") return "7 hari terakhir";
  if (dateRange.value === "30") return "30 hari terakhir";
});

const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  data: null,
});

async function fetchActivities() {
  try {
    const res = await api.get("/stats/recent-activities");
    activities.value = res.data.data;
  } catch (err) {
    console.error("Failed load activities", err);
  }
}

async function fetchInsights() {
  try {
    const res = await api.get("/stats/insight", {
      params: {
        outletId: outletFilter.value,
        range: dateRange.value,
      },
    });

    let raw = res.data?.data;

    // 🔥 normalize ke array
    if (!raw) {
      insights.value = [];
      return;
    }

    if (!Array.isArray(raw)) {
      raw = [raw];
    }

    insights.value = raw.map(formatInsight).filter(Boolean);
  } catch (err) {
    console.error("Failed load insights", err);
    insights.value = [];
  }
}

async function fetchTopOutlets() {
  const res = await api.get("/stats/top-outlets", {
    params: {
      range: dateRange.value,
    },
  });

  topOutlets.value = res.data.data; // top 3
}

const maxOutletRevenue = computed(() =>
  Math.max(...topOutlets.value.map((o) => o.revenue), 1),
);

async function fetchRevenueChart() {
  try {
    const res = await api.get("/stats/revenue-chart");

    revenueChart.value = res.data.data;
  } catch (err) {
    console.error("Failed load revenue chart", err);
  }
}

async function fetchOutlets() {
  try {
    const res = await api.get("/outlet");

    const list = res.data.data;

    outlets.value = [
      { id: "all", name: "Semua Outlet" },
      ...list.map((o) => ({
        id: o.id,
        name: o.name,
      })),
    ];
  } catch (err) {
    console.error("Failed load outlets:", err);
  }
}

async function checkPending() {
  try {
    const res = await api.get("/subscription/check-pending");
    hasPendingSubscription.value = res.data.hasPending;
  } catch (err) {
    console.error(err);
  }
}

async function getProfitToday() {
  try {
    const res = await api.get("/stats/profit", {
      params: {
        outletId: outletFilter.value,
        range: dateRange.value, // 7 / 30
      },
    });

    profitToday.value = res.data.data.totalProfit;
    totalRevenue.value = res.data.data.totalRevenue;
    totalTransactions.value = res.data.data.totalTransactions;
  } catch (err) {
    console.error("Failed get profit:", err);
  }
}

const showTooltip = (event, d) => {
  tooltip.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    data: d,
  };
};

const moveTooltip = (event) => {
  tooltip.value.x = event.clientX;
  tooltip.value.y = event.clientY;
};

const hideTooltip = () => {
  tooltip.value.show = false;
};

const totalRevenueMonth = computed(() => {
  return revenueChart.value.reduce((sum, d) => sum + Number(d.total || 0), 0);
});

const maxRevenue = computed(() =>
  Math.max(...revenueChart.value.map((d) => d.total || 0), 1),
);

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID").format(value);
}

watch([outletFilter, dateRange], () => {
  getProfitToday();
});

onMounted(() => {
  checkPending();
  fetchOutlets();
  getProfitToday();
  fetchRevenueChart();
  fetchTopOutlets();
  fetchActivities();
  fetchInsights();

  setTimeout(() => {
    animated.value = true;
  }, 100);
});
</script>

<template>
  <DashboardLayout title="Dashboard">
    <div class="flex justify-between items-center flex-wrap gap-3">
      <div>
        <h2 class="text-2xl font-semibold">Dashboard</h2>
        <p class="text-gray-500">
          Selamat datang kembali,
          <span class="text-blue-900 font-medium">{{
            userStore.user?.name
          }}</span>
          👋
        </p>
      </div>
      <!-- RIGHT FILTER -->
      <div class="flex items-center gap-3">
        <!-- FILTER OUTLET -->
        <Select v-model="outletFilter">
          <SelectTrigger class="w-[180px] bg-white">
            <SelectValue placeholder="Pilih Outlet" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem v-for="o in outlets" :key="o.id" :value="String(o.id)">
              {{ o.name }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- FILTER RANGE -->
        <Select v-model="dateRange">
          <SelectTrigger class="w-[140px] bg-white">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="today">Hari Ini</SelectItem>
            <SelectItem value="7">7 Hari</SelectItem>
            <SelectItem value="30">30 Hari</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div
      v-if="hasPendingSubscription"
      class="w-full px-6 py-4 bg-slate-900 text-white rounded-md shadow-md"
    >
      <div class="flex justify-between">
        <div>
          <p class="font-semibold">
            Planmu masih belum aktif nih. Apakah sudah melakukan pembayaran?
          </p>
          <p class="text-sm text-slate-400">
            Jika sudah melakukan pembayaran hubungi admin untuk mengaktifkan
            plan kamu disini ya.
          </p>
        </div>
        <div class="px-4 py-2 bg-slate-50 rounded-md">
          <a
            href="https://wa.me/087770999062"
            class="text-slate-800 font-medium"
            >Chat admin</a
          >
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- OMZET -->
      <div class="bg-white border rounded-lg p-5">
        <div class="flex gap-2 items-center mb-2">
          <div
            class="w-8 h-8 bg-slate-100 text-blue-900 rounded-lg flex items-center justify-center"
          >
            <Wallet class="w-4 h-4" />
          </div>
          <p class="text-base font-semibold text-slate-800">Total Revenue</p>
        </div>

        <div class="flex items-center justify-between mb-2">
          <h2 class="text-2xl text-slate-800 font-bold">
            Rp {{ formatRupiah(totalRevenue) }}
          </h2>

          <!-- Sparkline -->
          <svg viewBox="0 0 100 40" class="w-16 h-8 text-blue-600" fill="none">
            <polyline
              points="0,30 15,22 30,26 45,15 60,18 75,10 100,14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <p class="text-sm text-slate-600">
          Total pendapatan {{ dateRangeLabel }} dari semua transaksi
        </p>
      </div>

      <!-- TRANSAKSI -->
      <div class="bg-white border rounded-lg p-5">
        <div class="flex gap-2 items-center mb-2">
          <div
            class="w-8 h-8 bg-slate-100 text-indigo-900 rounded-lg flex items-center justify-center"
          >
            <ArrowLeftRight class="w-4 h-4" />
          </div>
          <p class="text-base font-semibold text-slate-800">Transaksi</p>
        </div>

        <div class="flex items-baseline mb-2 gap-2">
          <h2 class="text-2xl text-slate-800 font-bold">
            {{ totalTransactions }}
          </h2>
          <p class="text-sm text-slate-500">transaksi</p>
        </div>

        <p class="text-sm text-slate-600">
          Jumlah transaksi yang terjadi {{ dateRangeLabel }}
        </p>
      </div>

      <!-- PROFIT -->
      <div class="bg-white border rounded-lg p-5">
        <div class="flex gap-2 items-center mb-2">
          <div
            class="w-8 h-8 bg-slate-100 text-green-900 rounded-lg flex items-center justify-center"
          >
            <ArrowUpRight class="w-4 h-4" />
          </div>
          <p class="text-base font-semibold text-slate-800">Profit</p>
        </div>

        <div class="flex items-center justify-between mb-2">
          <h2 class="text-2xl text-slate-800 font-bold">
            Rp {{ formatRupiah(profitToday) }}
          </h2>

          <!-- mini trend -->
          <span
            class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full"
          >
            +12%
          </span>
        </div>

        <p class="text-sm text-slate-600">
          Keuntungan bersih {{ dateRangeLabel }}
        </p>
      </div>
    </div>

    <!-- Chart -->
    <div class="bg-white border rounded-xl p-6">
      <!-- TOOLTIP -->
      <div
        v-if="tooltip.show"
        class="fixed z-50 pointer-events-none"
        :style="{
          top: tooltip.y + 12 + 'px',
          left: tooltip.x + 12 + 'px',
        }"
      >
        <div class="bg-white border shadow-lg rounded-lg p-3 w-44">
          <!-- DATE -->
          <p class="text-xs text-slate-500 mb-2">
            {{
              new Date(tooltip.data.date).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
              })
            }}
          </p>

          <!-- VALUE -->
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Revenue</span>
            <span class="text-blue-600 font-semibold">
              Rp {{ formatRupiah(tooltip.data.total) }}
            </span>
          </div>
        </div>
      </div>
      <!-- HEADER -->
      <div
        class="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-2"
      >
        <div>
          <h3 class="text-lg font-semibold text-slate-800">Revenue Trend</h3>
          <p class="text-sm text-slate-500">
            Performa omzet berdasarkan waktu
            {{ new Date().toLocaleString("id-ID", { month: "long" }) }}
          </p>
        </div>

        <div class="text-left md:text-right">
          <p class="text-xs text-slate-500">Total</p>
          <p class="text-sm font-semibold text-blue-600">
            Rp {{ formatRupiah(totalRevenueMonth) }}
          </p>
        </div>
      </div>

      <!-- CHART -->
      <div class="overflow-x-auto pb-2">
        <div class="h-64 flex items-end gap-2 min-w-[600px] md:min-w-0">
          <div
            v-for="(d, i) in revenueChart"
            :key="i"
            class="flex-1 flex flex-col items-center"
          >
            <!-- BAR -->
            <div class="w-full flex items-end justify-center h-52">
              <div
                class="w-3 rounded-md bg-blue-500 transition-all duration-700 ease-out hover:bg-blue-600 cursor-pointer"
                :style="{
                  height: animated ? (d.total / maxRevenue) * 100 + '%' : '0%',
                }"
                @mouseenter="(e) => showTooltip(e, d)"
                @mousemove="moveTooltip"
                @mouseleave="hideTooltip"
              ></div>
            </div>

            <!-- LABEL -->
            <span class="text-[10px] text-slate-400 mt-2">
              {{ new Date(d.date).getDate() }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <!-- TOP OUTLET -->
      <div class="bg-white border rounded-xl p-6">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-slate-800">Top Outlet</h3>
          <p class="text-sm text-slate-500">
            Perbandingan performa outlet {{ dateRangeLabel }}
          </p>
        </div>

        <div class="space-y-4">
          <div v-for="(o, i) in topOutlets" :key="o.id" class="space-y-1">
            <!-- HEADER -->
            <div v-if="topOutlets.length === 0" class="text-sm text-slate-400">
              Belum ada data outlet
            </div>

            <div class="flex justify-between text-sm">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-400">
                  #{{ i + 1 }}
                </span>
                <span class="text-slate-700 font-medium">
                  {{ o.name }}
                </span>
              </div>

              <span class="text-slate-600">
                Rp {{ formatRupiah(o.revenue) }}
              </span>
            </div>

            <!-- MINI BAR -->
            <div class="w-full bg-slate-100 rounded-full h-2">
              <div
                class="bg-blue-500 h-2 rounded-full transition-all duration-700"
                :style="{
                  width: (o.revenue / maxOutletRevenue) * 100 + '%',
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- APT INSIGHT -->
      <div class="bg-white border rounded-xl p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-800">
              Avg Profit Transaction
            </h3>
            <p class="text-sm text-slate-500">
              Rata-rata nilai transaksi {{ dateRangeLabel }}
            </p>
          </div>

          <!-- badge -->
          <span
            class="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full"
          >
            APT
          </span>
        </div>

        <!-- VALUE -->
        <div class="mb-3">
          <h2 class="text-2xl font-bold text-slate-800">
            Rp {{ formatRupiah(apt) }}
          </h2>
        </div>

        <!-- INSIGHT -->
        <div class="bg-slate-50 rounded-lg p-3">
          <p class="text-sm text-slate-700">
            {{ aptInsight }}
          </p>
        </div>

        <!-- EXTRA CONTEXT -->
        <div class="mt-3 text-xs text-slate-400">
          Berdasarkan {{ totalTransactions }} transaksi
        </div>
      </div>

      <!-- INSIGHT -->
      <div class="bg-white border rounded-xl p-6 mt-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-slate-800">Insight & Alert</h3>

          <span class="text-xs text-slate-400">
            Berdasarkan {{ dateRangeLabel }}
          </span>
        </div>

        <!-- TEXT INSIGHT -->
        <div class="space-y-2">
          <p
            v-for="(item, i) in insights"
            :key="i"
            class="text-sm text-slate-700 leading-relaxed"
          >
            {{ item.text }}
          </p>
        </div>

        <div v-if="insights.length === 0" class="text-sm text-slate-400 mt-3">
          Belum ada insight saat ini
        </div>
      </div>

      <!-- ACTIVITY -->
      <div class="bg-white border rounded-xl p-6 mt-4">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-800">
              Aktivitas Terbaru
            </h3>
            <p class="text-xs text-slate-400">
              Aktivitas terbaru dari sistem POS kamu
            </p>
          </div>

          <span class="text-xs text-slate-400"> Live </span>
        </div>

        <!-- LIST -->
        <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          <div
            v-for="(a, i) in activities"
            :key="i"
            class="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition"
          >
            <!-- ICON -->
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              :class="{
                'bg-blue-500': a.type === 'transaction',
                'bg-red-500': a.type === 'stock',
                'bg-yellow-500': a.type === 'refund',
              }"
            >
              ●
            </div>

            <!-- CONTENT -->
            <div class="flex-1">
              <p class="text-sm text-slate-700">
                {{ a.message }}
              </p>

              <span class="text-xs text-slate-400">
                {{
                  new Date(a.time).toLocaleString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                  })
                }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="activities.length === 0" class="text-sm text-slate-400 mt-3">
          Belum ada aktivitas terbaru
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
