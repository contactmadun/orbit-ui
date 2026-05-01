<script setup>
import DashboardLayout from "@/components/reusable/DashboardLayout.vue";
import Skeleton from "@/components/reusable/Skeleton.vue";
import {
  Users,
  CircleCheck,
  UserRoundCheckIcon,
  UserRoundCog,
  UserRoundX,
  BarChart3,
} from "lucide-vue-next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ref, computed, onMounted, watch, watchEffect } from "vue";
import { useRouter } from "vue-router";
import api from "@/axios";

const productRange = ref("thisMonth");
const router = useRouter();
const isReady = ref(false);
const loadingStats = ref(true);
const loadingTransaction = ref(true);
const loadingSteps = ref(true);
const loading = ref(false);
const hasOutlet = ref(false);
const hasUser = ref(false);
const hasProduct = ref(false);
const totalProduct = ref();
const totalCategory = ref();
const outlets = ref([{ id: "all", name: "Semua Outlet" }]);
const outletFilter = ref("all"); // default semua outlet
const dateRange = ref("today"); // default hari ini
const totalTransaction = ref(0);
const allStepsDone = computed(() => steps.value.every((s) => s.done));
const providerData = ref([]);
const chartColors = [
  "#f59e0b", // amber (utama seperti design kamu)
  "#06b6d4", // cyan
  "#f97316", // orange
  "#6366f1", // indigo
  "#22c55e", // green soft
];
const pieGradient = computed(() => {
  if (!providerPercent.value.length) return "";

  const gradient = providerPercent.value
    .map((p) => `${p.color} ${p.start}% ${p.end}%`)
    .join(", ");

  return `conic-gradient(${gradient})`;
});

const topProvider = computed(() => {
  if (!providerData.value.length) return null;

  return [...providerData.value].sort((a, b) => b.value - a.value)[0];
});

const fetchTransactionType = async () => {
  try {
    const res = await api.get("/stats/transaction-type", {
      params: {
        outletId: outletFilter.value,
      },
    });

    providerData.value = res.data.data.map((item, i) => ({
      ...item,
      color: chartColors[i % chartColors.length],
    }));
  } catch (err) {
    console.error(err);
  }
};

const totalProvider = computed(() =>
  providerData.value.reduce((sum, i) => sum + i.value, 0),
);

const providerPercent = computed(() => {
  const total = totalProvider.value || 1;

  let cumulative = 0;

  return providerData.value.map((item) => {
    const percent = (item.value / total) * 100;

    const start = cumulative;
    cumulative += percent;

    return {
      ...item,
      percent,
      start,
      end: cumulative,
    };
  });
});

const maxValue = computed(() => {
  const values = heatmapData.value.map((d) => d.value || 0);
  return Math.max(...values, 1); // minimal 1 biar gak NaN
});

const processedHeatmap = computed(() => {
  return heatmapData.value.map((item) => {
    const percent = (item.value / maxValue.value) * 100;

    return {
      ...item,
      percent,
      isPeak: item.value === maxValue.value,
    };
  });
});

const getInterval = (endHour) => {
  const end = Number(endHour);
  const start = end - 1;

  return {
    start,
    end,
    text: `${String(start).padStart(2, "0")}:00 - ${String(end).padStart(2, "0")}:59`,
  };
};

// detect peak
const peakIndex = computed(() => {
  return heatmapData.value.findIndex((d) => d.value === maxValue.value);
});

const peakDuration = computed(() => {
  const peak = heatmapData.value[peakIndex.value];
  return `~${peak?.value} transaksi`;
});

const stayDuration = "1–2 jam";

const topProducts = ref([]);

const heatmapData = ref([]);

const fetchPeakHour = async () => {
  try {
    const res = await api.get("/stats/peak-hour", {
      params: {
        outletId: outletFilter.value,
      },
    });

    heatmapData.value = res.data.data;
  } catch (err) {
    console.error("Failed fetch peak hour:", err);
  }
};

const fetchTopProducts = async () => {
  try {
    const res = await api.get("/stats/top-product", {
      params: {
        range: productRange.value,
        outletId: outletFilter.value,
      },
    });

    topProducts.value = res.data.data;

    // reset animasi
    animatedWidths.value = topProducts.value.map(() => 0);

    setTimeout(() => {
      animatedWidths.value = topProducts.value.map((p) => p.percent);
    }, 200);
  } catch (err) {
    console.error("Failed fetch top products:", err);
  }
};

const fetchTransaction = async () => {
  try {
    loadingTransaction.value = true;

    const res = await api.get("/stats/transaction", {
      params: {
        outletId: outletFilter.value,
        range: dateRange.value,
      },
    });

    totalTransaction.value = res.data.data.totalTransaction;
  } catch (err) {
    console.error("Failed fetch transaction:", err);
  } finally {
    loadingTransaction.value = false;
  }
};

const fetchUser = async () => {
  try {
    const res = await api.get("/users/tenant"); // endpoint getUserByTenant
    console.log("USER RESPONSE:", res.data);
    hasUser.value = res.data.totalCashier > 0;
  } catch (err) {
    console.error(err);
  }
};

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

// fetch outlet
const fetchOutlet = async () => {
  try {
    loading.value = true;
    const res = await api.get("/outlet"); // sesuaikan dengan route kamu
    hasOutlet.value = res.data.data.length > 0;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchProduct = async () => {
  try {
    const res = await api.get("/products/check");

    hasProduct.value = res.data.hasProduct;
  } catch (err) {
    console.error(err);
  }
};

const fetchStats = async () => {
  try {
    loadingStats.value = true;

    const res = await api.get("/stats");

    totalProduct.value = res.data.data.totalProduct;
    totalCategory.value = res.data.data.totalCategory;
  } catch (err) {
    console.error(err);
  } finally {
    loadingStats.value = false;
  }
};

const animatedWidths = ref([]);

onMounted(() => {
  // init 0 dulu
  animatedWidths.value = topProducts.value.map(() => 0);

  // trigger animasi setelah render
  setTimeout(() => {
    animatedWidths.value = topProducts.value.map((p) => p.percent);
  }, 200);
});

onMounted(async () => {
  loadingSteps.value = true;

  await fetchOutlet();
  await fetchOutlets();
  await fetchUser();
  await fetchProduct();
  await fetchTopProducts();
  await fetchPeakHour();
  await fetchTransactionType();

  loadingSteps.value = false;
  isReady.value = true;
  await fetchStats();
  await fetchTransaction();
});

const steps = computed(() => [
  {
    id: 1,
    title: "Buat Outlet",
    desc: "Tambahkan outlet untuk mulai transaksi.",
    done: hasOutlet.value,
    active: !hasOutlet.value,
    route: "/outlet",
  },
  {
    id: 2,
    title: "Tambah User Kasir",
    desc: "Berikan akses kasir untuk transaksi.",
    done: hasUser.value,
    active: hasOutlet.value && !hasUser.value,
    route: "/user",
  },
  {
    id: 3,
    title: "Tambah Produk",
    desc: "Input produk agar bisa dijual.",
    done: hasProduct.value,
    active: hasOutlet.value && hasUser.value && !hasProduct.value,
    route: "/product",
  },
]);

watch(productRange, () => {
  fetchTopProducts();
  // reset animasi
  animatedWidths.value = topProducts.value.map(() => 0);

  setTimeout(() => {
    animatedWidths.value = topProducts.value.map((p) => p.percent);
  }, 200);
});

watch([outletFilter, dateRange], () => {
  fetchTransaction();
  fetchPeakHour();
  fetchTransactionType();
});

watch(processedHeatmap, (d) => {
  console.log(
    "percent:",
    d.map((x) => x.percent),
  );
});

watchEffect(() => {
  const total = totalProvider.value || 1;

  providerData.value = providerData.value.map((item) => ({
    ...item,
    percent: ((item.value / total) * 100).toFixed(1),
  }));
});
</script>

<template>
  <div class="space-y-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-semibold">Overview POS</h1>
        </div>
        <p class="text-slate-500 text-sm">
          Jelajahi informasi mengenai bisnis anda disini
        </p>
      </div>
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

    <!-- Main Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-2 mt-6 items-start">
      <!-- LEFT: CARD AREA -->
      <div
        class="xl:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
      >
        <!-- CARD 1 -->
        <div class="bg-white border rounded-lg p-5">
          <div class="flex gap-2 items-center mb-2">
            <div
              class="w-8 h-8 bg-slate-100 text-blue-900 rounded-lg flex items-center justify-center"
            >
              <Users class="w-4 h-4" />
            </div>
            <p class="text-base font-semibold text-slate-800">Total Product</p>
          </div>

          <div v-if="loadingStats">
            <Skeleton class="h-7 w-20 mb-2" />
            <Skeleton class="h-4 w-32" />
          </div>

          <div v-else class="flex items-center mb-2 gap-1">
            <h2 class="text-2xl text-slate-800 font-bold mt-1">
              {{ totalProduct }}
            </h2>
            <p class="text-xs text-green-800 mt-1">+15.9%</p>
          </div>
          <p class="text-sm text-slate-600">
            Data real time product yang tercatat di sistem.
          </p>
        </div>

        <!-- CARD 2 -->
        <div class="bg-white border rounded-lg p-5">
          <div class="flex gap-2 items-center mb-2">
            <div
              class="w-8 h-8 bg-slate-100 text-blue-900 rounded-lg flex items-center justify-center"
            >
              <UserRoundCheckIcon class="w-4 h-4" />
            </div>
            <p class="text-base font-semibold text-slate-800">
              Total Transaction
            </p>
          </div>

          <div v-if="loadingStats">
            <Skeleton class="h-7 w-20 mb-2" />
            <Skeleton class="h-4 w-32" />
          </div>

          <div v-else class="flex items-center mb-2 gap-1">
            <h2 class="text-2xl text-slate-800 font-bold mt-1">
              {{ totalTransaction }}
            </h2>
            <p class="text-xs text-green-800 mt-1">+15.9%</p>
          </div>
          <p class="text-sm text-slate-600">
            Data real time tenant aktif transaksi di sistem.
          </p>
        </div>

        <!-- CARD 3 -->
        <div class="bg-white border rounded-lg p-5">
          <div class="flex gap-2 items-center mb-2">
            <div
              class="w-8 h-8 bg-slate-100 text-blue-900 rounded-lg flex items-center justify-center"
            >
              <UserRoundX class="w-4 h-4" />
            </div>
            <p class="text-base font-semibold text-slate-800">
              Category Product
            </p>
          </div>

          <div v-if="loadingStats">
            <Skeleton class="h-7 w-20 mb-2" />
            <Skeleton class="h-4 w-32" />
          </div>

          <div v-else class="flex items-center mb-2 gap-1">
            <h2 class="text-2xl text-slate-800 font-bold mt-1">
              {{ totalCategory }}
            </h2>
            <p class="text-xs text-green-800 mt-1">+15.9%</p>
          </div>
          <p class="text-sm text-slate-600">
            Data real time tenant expired di sistem.
          </p>
        </div>
      </div>

      <!-- RIGHT: GUIDE STEP -->
      <div class="xl:col-span-3">
        <div
          class="rounded-2xl p-5 shadow-lg flex flex-col justify-between"
          :class="
            !isReady
              ? 'bg-white text-slate-900 border'
              : allStepsDone
                ? 'bg-white text-slate-900 border'
                : 'bg-gradient-to-b from-slate-900 to-slate-800 text-white'
          "
        >
          <div
            v-if="!isReady"
            class="flex flex-col justify-center items-center h-full text-center"
          >
            <Skeleton class="h-5 w-40 mb-6" />
            <Skeleton class="h-4 w-52 mb-8" />
            <Skeleton class="h-10 w-full rounded-xl" />
          </div>
          <div
            v-else-if="allStepsDone"
            class="flex flex-col justify-center items-center h-full text-center"
          >
            <h3 class="text-lg font-semibold mb-1">Siap Transaksi 🚀</h3>
            <p class="text-sm text-slate-500 mb-6">Semua setup sudah selesai</p>

            <button
              @click="$router.push('/pos/open-session')"
              class="w-full py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition"
            >
              Mulai Transaksi POS
            </button>
          </div>
          <div v-else>
            <h3 class="text-lg font-semibold mb-6 flex items-center gap-2">
              Mulai POS Sekarang
            </h3>

            <div class="space-y-4">
              <div
                v-for="step in steps"
                :key="step.id"
                @click="step.active && router.push(step.route)"
                class="flex items-start gap-3 p-4 rounded-xl transition cursor-pointer"
                :class="[
                  step.done
                    ? 'bg-slate-700/40'
                    : step.active
                      ? 'bg-slate-700 hover:bg-slate-600'
                      : 'bg-slate-800 opacity-40 cursor-not-allowed',
                ]"
              >
                <div
                  class="size-8 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold"
                  :class="[
                    step.done
                      ? 'bg-green-500 text-white'
                      : step.active
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-600 text-slate-300',
                  ]"
                >
                  <CircleCheck v-if="step.done" class="w-4 h-4" />
                  <span v-else>{{ step.id }}</span>
                </div>

                <div>
                  <p class="font-medium">{{ step.title }}</p>
                  <p class="text-sm text-slate-300">
                    {{ step.desc }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- INSIGHT SECTION -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-2 mt-6">
      <!-- LEFT: TOP PRODUCT -->
      <div class="xl:col-span-8 bg-white border rounded-xl p-5">
        <!-- HEADER -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-3">
            <div
              class="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-blue-900 flex items-center justify-center"
            >
              <BarChart3 class="w-5 h-5" />
            </div>

            <div>
              <h3 class="text-lg font-semibold text-slate-800">
                10 Produk Terlaris
              </h3>
              <p class="text-sm text-slate-500">
                Berdasarkan jumlah penjualan (qty)
              </p>
            </div>
          </div>

          <!-- FILTER -->
          <Select v-model="productRange">
            <SelectTrigger class="w-[140px] bg-white">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="thisMonth">Bulan Ini</SelectItem>
              <SelectItem value="lastMonth">Bulan Lalu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- TABLE -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-slate-500 border-b">
                <th class="py-2 w-[60px]">#</th>
                <th class="py-2">Produk</th>
                <th class="py-2 w-[50%]">Penjualan</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item, i) in topProducts"
                :key="i"
                class="border-b last:border-0 hover:bg-slate-50 transition"
              >
                <!-- RANK -->
                <td class="py-3 font-medium text-slate-700">
                  <div class="flex items-center gap-2">
                    <!-- ICON WRAPPER (FIX WIDTH) -->
                    <div class="w-5 flex justify-center">
                      <span v-if="i === 0">🚀</span>
                      <span v-else-if="i === 1">🏆</span>
                      <span v-else-if="i === 2">🥉</span>
                      <span v-else class="invisible">•</span>
                    </div>

                    <!-- NUMBER -->
                    <span>{{ i + 1 }}</span>
                  </div>
                </td>

                <!-- NAME -->
                <td class="py-3 text-slate-700">
                  {{ item.name }}
                </td>

                <!-- PROGRESS -->
                <td class="py-3">
                  <div
                    class="w-full bg-slate-100 rounded-full h-3 overflow-hidden"
                  >
                    <div
                      class="bg-blue-600 h-3 rounded-full transition-all duration-700 ease-out"
                      :style="{ width: animatedWidths[i] + '%' }"
                    ></div>
                  </div>

                  <p class="text-xs text-slate-500 mt-1">
                    {{ item.qty }} terjual
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="xl:col-span-4 flex flex-col gap-2">
        <div class="bg-white border rounded-xl p-5">
          <!-- HEADER -->
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-slate-800">
              Review Peak Hour
            </h3>
            <p class="text-sm text-slate-500">
              Waktu dengan transaksi tertinggi hari ini
            </p>
          </div>

          <div class="relative h-40 mb-6">
            <!-- GRID LINES -->
            <div
              class="absolute inset-6 flex flex-col justify-between pointer-events-none"
            >
              <div class="border-t border-slate-100"></div>
              <div class="border-t border-slate-100"></div>
              <div class="border-t border-slate-100"></div>
              <div class="border-t border-slate-100"></div>
            </div>

            <!-- CHART -->
            <div
              class="flex items-end justify-between h-full gap-2 relative z-10"
            >
              <div
                v-for="item in processedHeatmap"
                :key="item.label"
                class="flex flex-col items-center justify-end flex-1 h-full"
              >
                <div
                  class="w-full rounded-md relative group"
                  :class="item.isPeak ? 'bg-red-500' : 'bg-slate-300'"
                  :style="{ height: item.percent + '%' }"
                >
                  <!-- TOOLTIP -->
                  <div
                    class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap bg-slate-900 text-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-10"
                  >
                    <div class="font-semibold">
                      {{ getInterval(item.label).text }}
                    </div>

                    <div class="text-slate-300">{{ item.value }} transaksi</div>

                    <div
                      v-if="item.isPeak"
                      class="text-red-400 font-medium mt-1"
                    >
                      🔥 Peak hour
                    </div>
                  </div>
                </div>

                <p class="text-xs text-slate-500 mt-2">
                  {{ item.label }}
                </p>
              </div>
            </div>
          </div>
          <!-- AI INSIGHT -->
          <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p class="text-xs text-slate-500 mb-1">🤖 AI analysis</p>

            <h4 class="text-sm font-semibold text-slate-800 mb-2">
              Today’s Prediction
            </h4>

            <div
              class="flex items-center justify-between text-sm text-slate-600"
            >
              <span> ⏳ Peak {{ peakDuration }} </span>
              <span> ⏱ Stay {{ stayDuration }} </span>
            </div>
          </div>
        </div>
        <!-- RIGHT: HEATMAP JAM RAMAI -->

        <div
          class="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl p-6 flex-1"
        >
          <!-- HEADER -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-slate-800">
              Transaksi Berdasarkan Tipe
            </h3>
            <p class="text-sm text-slate-500">Distribusi transaksi hari ini</p>
          </div>

          <!-- TOP: DOMINANT (PINDAH KE ATAS) -->
          <div class="mb-5">
            <p class="text-xs text-slate-500 mb-1">Tipe Terbanyak</p>

            <div class="flex items-center gap-2">
              <div
                class="w-3 h-3 rounded-full"
                :style="{ background: topProvider?.color }"
              ></div>

              <span class="text-lg font-semibold text-slate-800">
                {{ topProvider?.name || "-" }}
              </span>
            </div>

            <p class="text-sm text-slate-500">
              {{ topProvider?.percent || 0 }}% dari total
            </p>
          </div>

          <!-- DONUT CENTER -->
          <div class="flex justify-center mb-6">
            <div class="relative w-44 h-44">
              <!-- CHART -->
              <div
                class="w-full h-full rounded-full transition-all duration-500"
                :style="{ background: pieGradient }"
              ></div>

              <!-- INNER CUT -->
              <div class="absolute inset-5 bg-white rounded-full"></div>

              <!-- CENTER TEXT -->
              <div
                class="absolute inset-0 flex flex-col items-center justify-center"
              >
                <span class="text-xs text-slate-500">Total</span>
                <span class="text-xl font-semibold text-slate-800">
                  {{ totalProvider }}
                </span>
              </div>
            </div>
          </div>

          <!-- BOTTOM: LEGEND (PINDAH KE BAWAH) -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-2">
            <div
              v-for="item in providerData"
              :key="item.name"
              class="relative group flex items-center gap-2 text-sm text-slate-700 cursor-default"
            >
              <!-- DOT COLOR -->
              <div
                class="w-2.5 h-2.5 rounded-full"
                :style="{ background: item.color }"
              ></div>

              <!-- NAME -->
              <span class="truncate">
                {{ item.name }}
              </span>

              <!-- TOOLTIP -->
              <div
                class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap bg-slate-900 text-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-10"
              >
                <div class="font-medium">{{ item.name }}</div>
                <div class="text-slate-300">{{ item.value }} transaksi</div>
                <div class="text-slate-400">{{ item.percent }}%</div>
              </div>
            </div>
          </div>
          <!-- FOOTER INSIGHT -->
          <div
            class="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600"
          >
            💡 Fokus utama hari ini ada pada
            <span class="font-semibold text-slate-800">
              {{ topProvider?.name || "-" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
