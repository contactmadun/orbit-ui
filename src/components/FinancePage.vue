<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "@/axios";
import DashboardLayout from "@/components/reusable/DashboardLayout.vue";
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-vue-next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const outletFilter = ref("all");
const outlets = ref([{ id: "all", name: "All Outlet" }]);
const cashflow = ref([]); // ganti dummy jadi dari API
const expenseGrowth = -8.3;
const accounts = ref([]);

const fetchAccounts = async () => {
  const res = await api.get("/fund", {
    params: { outletId: outletFilter.value },
  });

  accounts.value = res.data.data || [];
};

const totalAccount = computed(() => accounts.value.length);

const fetchOutlets = async () => {
  try {
    const res = await api.get("/outlet");

    outlets.value = [
      { id: "all", name: "All Outlet" },
      ...res.data.data.map((o) => ({
        id: o.id,
        name: o.name,
      })),
    ];
  } catch (err) {
    console.error("Failed load outlets", err);
  }
};

const fetchCashflow = async () => {
  try {
    const res = await api.get("/finance/cashflow", {
      params: {
        outletId: outletFilter.value,
      },
    });

    cashflow.value = res.data.data;
  } catch (err) {
    console.error("Failed load cashflow", err);
  }
};

const maxAbsValue = computed(() =>
  Math.max(...cashflow.value.map((d) => Math.abs(d.net))),
);

const totalNet = computed(() =>
  cashflow.value.reduce((sum, d) => sum + d.net, 0),
);

/* ================= COMPUTED ================= */
const totalIncome = computed(() =>
  cashflow.value.reduce((sum, d) => sum + Number(d.income || 0), 0),
);

const totalExpense = computed(() =>
  cashflow.value.reduce((sum, d) => sum + Number(d.expense || 0), 0),
);

const totalBalance = computed(() =>
  accounts.value.reduce((sum, acc) => sum + Number(acc.balance || 0), 0),
);

/* ================= HELPER ================= */
const formatCurrency = (val) => {
  return "Rp " + Number(val).toLocaleString("id-ID");
};

/* ================= CHART SCALE ================= */
const maxValue = computed(() =>
  Math.max(...cashflow.value.map((d) => Math.max(d.income, d.expense))),
);

const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  data: null,
});

const showTooltip = (event, d) => {
  tooltip.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    data: d,
  };
};

const hideTooltip = () => {
  tooltip.value.show = false;
};

const animated = ref(false);

onMounted(() => {
  fetchOutlets();
  fetchCashflow();
  fetchAccounts();

  setTimeout(() => {
    animated.value = true;
  }, 100);
});

watch(outletFilter, () => {
  fetchCashflow();
  fetchAccounts(); // ⬅️ WAJIB
});
</script>

<template>
  <DashboardLayout title="Keuangan">
    <div class="space-y-6">
      <!-- HEADER -->
      <div class="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-semibold text-slate-800">Keuangan</h1>
          <p class="text-slate-500 text-sm">
            Monitor semua pergerakan saldo akun
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- FILTER OUTLET -->
          <Select v-model="outletFilter">
            <SelectTrigger class="w-[180px] bg-white">
              <SelectValue placeholder="Pilih Outlet" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem
                v-for="o in outlets"
                :key="o.id"
                :value="String(o.id)"
              >
                {{ o.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <button
            @click="openTransfer"
            class="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 text-sm"
          >
            <ArrowDownLeft class="w-4 h-4" />
            Pemasukan
          </button>

          <button
            @click="openTopup"
            class="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 text-sm"
          >
            <ArrowUpRight class="w-4 h-4" />
            Pengeluaran
          </button>
        </div>
      </div>

      <!-- ================= SUMMARY CARDS ================= -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- TOTAL BALANCE (REFINED - TALL VERSION) -->
        <div
          class="relative overflow-hidden rounded-xl p-5 pb-15 text-white bg-teal-700 shadow-lg min-h-[180px] flex flex-col justify-between"
        >
          <!-- DECORATION -->
          <div
            class="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"
          ></div>

          <!-- HEADER -->
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-teal-100">
              {{ totalAccount }} Akun Keuangan
            </p>

            <div class="p-2 bg-white/10 rounded-lg">
              <Wallet class="w-4 h-4 text-white" />
            </div>
          </div>

          <!-- CONTENT -->
          <div>
            <!-- TITLE -->
            <p class="text-sm text-teal-200 mb-1">Total Saldo Akun</p>

            <!-- VALUE -->
            <h2 class="text-3xl font-bold tracking-tight">
              {{ formatCurrency(totalBalance) }}
            </h2>
          </div>
        </div>

        <!-- INCOME (REFINED - BALANCED) -->
        <div
          class="bg-white border rounded-xl p-5 min-h-[140px] flex flex-col justify-between transition hover:shadow-md"
        >
          <!-- TOP -->
          <div>
            <div class="flex items-center justify-between">
              <p class="text-sm text-slate-600">Pemasukan bulan ini</p>
              <span class="text-xs text-slate-400">April</span>
            </div>

            <h2 class="text-3xl font-bold text-teal-700 mt-4">
              {{ formatCurrency(totalIncome) }}
            </h2>
          </div>

          <!-- BOTTOM -->
          <div class="mt-3 pt-3 border-t border-slate-100 space-y-1">
            <p class="text-xs text-slate-500">Dari 124 transaksi</p>

            <p class="text-xs text-teal-600 flex items-center gap-1">
              +12.5% dari bulan lalu <span>↗</span>
            </p>
          </div>
        </div>

        <!-- EXPENSE (TEAL SOFT VERSION) -->
        <div
          class="bg-white border rounded-xl p-5 min-h-[140px] flex flex-col justify-between transition hover:shadow-md"
        >
          <!-- TOP -->
          <div>
            <div class="flex items-center justify-between">
              <p class="text-sm text-slate-600">Pengeluaran bulan ini</p>
              <span class="text-xs text-slate-400">April</span>
            </div>

            <!-- VALUE -->
            <h2 class="text-3xl font-bold text-amber-500 mt-4">
              {{ formatCurrency(totalExpense) }}
            </h2>
          </div>

          <!-- BOTTOM -->
          <div class="mt-3 pt-3 border-t border-slate-100 space-y-1">
            <p class="text-xs text-slate-500">Dari 98 transaksi</p>

            <!-- GROWTH -->
            <p class="text-xs text-amber-500 flex items-center gap-1">
              -8.3% dari bulan lalu <span>↘</span>
            </p>
          </div>
        </div>
      </div>

      <!-- ================= CASHFLOW CHART (NET) ================= -->
      <div class="bg-white border rounded-xl p-6">
        <!-- HEADER -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-semibold text-slate-800">Cashflow</h3>
            <p class="text-sm text-slate-500">
              Pergerakan saldo bersih (pemasukan - pengeluaran)
            </p>
          </div>

          <!-- TOTAL -->
          <div class="text-right">
            <p class="text-xs text-slate-500">Total Cashflow</p>
            <p
              class="text-sm font-semibold"
              :class="totalNet >= 0 ? 'text-teal-600' : 'text-amber-500'"
            >
              {{ formatCurrency(totalNet) }}
            </p>
          </div>
        </div>

        <!-- CHART -->
        <div class="relative h-64">
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

              <!-- INCOME -->
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-500">Pemasukan</span>
                <span class="text-teal-600 font-medium">
                  {{ formatCurrency(tooltip.data.income) }}
                </span>
              </div>

              <!-- EXPENSE -->
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-500">Pengeluaran</span>
                <span class="text-amber-500 font-medium">
                  {{ formatCurrency(tooltip.data.expense) }}
                </span>
              </div>

              <!-- NET -->
              <div class="flex justify-between text-xs mt-2 pt-2 border-t">
                <span class="text-slate-600 font-medium">Net</span>
                <span
                  class="font-semibold"
                  :class="
                    tooltip.data.net >= 0 ? 'text-teal-600' : 'text-amber-500'
                  "
                >
                  {{ formatCurrency(tooltip.data.net) }}
                </span>
              </div>
            </div>
          </div>
          <!-- ZERO LINE -->
          <div
            class="absolute top-1/2 left-0 w-full border-t border-slate-200"
          ></div>

          <!-- BARS -->
          <div class="flex items-center h-full gap-2">
            <div
              v-for="(d, i) in cashflow"
              :key="i"
              class="flex flex-col items-center flex-1 h-full"
            >
              <div
                class="relative w-full h-full flex items-center justify-center"
              >
                <!-- BAR -->
                <div
                  class="w-2 rounded cursor-pointer hover:opacity-80 transition-all duration-700 ease-out"
                  :class="d.net >= 0 ? 'bg-teal-500' : 'bg-amber-400'"
                  :style="{
                    height: animated
                      ? (Math.abs(d.net) / maxAbsValue) * 50 + '%'
                      : '0%',
                    transform: animated
                      ? d.net >= 0
                        ? 'translateY(-50%)'
                        : 'translateY(50%)'
                      : 'translateY(0)',
                  }"
                  @mouseenter="(e) => showTooltip(e, d)"
                  @mousemove="(e) => showTooltip(e, d)"
                  @mouseleave="hideTooltip"
                ></div>
              </div>

              <!-- DATE -->
              <span class="text-[10px] text-slate-400 mt-2">
                {{ new Date(d.date).getDate() }}
              </span>
            </div>
          </div>
        </div>

        <!-- LEGEND -->
        <div class="flex gap-6 mt-6 text-sm text-slate-600">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 bg-teal-500 rounded"></span>
            Cashflow Positif
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 bg-amber-400 rounded"></span>
            Cashflow Negatif
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
