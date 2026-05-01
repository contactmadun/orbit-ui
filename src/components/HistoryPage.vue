<script setup>
import { ref, onMounted, watch, computed } from "vue";
import api from "@/axios";
import DashboardLayout from "@/components/reusable/DashboardLayout.vue";
import TransactionDetailDrawer from "@/components/reusable/TransactionDetailDrawer.vue";
import { Search, ArrowLeftRight } from "lucide-vue-next";

/* ================= STATE ================= */
const transactions = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const perPage = ref(30);
const totalData = ref(0);
const totalPages = ref(1);
const showSkeleton = ref(true);

const filters = ref({
  search: "",
  status: "",
  type: "",
  startDate: "",
  endDate: "",
});

const selectedTransaction = ref(null);
const showDetail = ref(false);

/* ================= BULK ================= */
const selectedIds = ref([]);
const selectAll = ref(false);

const toggleAll = () => {
  if (selectAll.value) {
    selectedIds.value = transactions.value.map((t) => t.id);
  } else {
    selectedIds.value = [];
  }
};

const toggleOne = () => {
  if (selectedIds.value.length === transactions.value.length) {
    selectAll.value = true;
  } else {
    selectAll.value = false;
  }
};

/* ================= BULK ACTION ================= */
const bulkDelete = async () => {
  if (!selectedIds.value.length) return;

  const confirmDelete = confirm(`Hapus ${selectedIds.value.length} transaksi?`);
  if (!confirmDelete) return;

  try {
    // TODO: sambungkan ke API kamu
    // await api.post('/sale/bulk-delete', { ids: selectedIds.value })

    transactions.value = transactions.value.filter(
      (trx) => !selectedIds.value.includes(trx.id),
    );

    selectedIds.value = [];
    selectAll.value = false;
  } catch (err) {
    console.error(err);
  }
};

/* ================= FETCH ================= */
const fetchTransactions = async () => {
  loading.value = true;
  showSkeleton.value = true;

  try {
    const res = await api.get("/sale/history", {
      params: {
        ...filters.value,
        page: currentPage.value,
        limit: perPage.value,
      },
    });

    transactions.value = res.data.data;
    totalData.value = res.data.pagination.total;
    totalPages.value = res.data.pagination.totalPages;
  } catch (err) {
    console.error(err);
  } finally {
    // ⏳ delay biar smooth
    setTimeout(() => {
      loading.value = false;
      showSkeleton.value = false;
    }, 500);
  }
};

const formatItems = (items) => {
  if (!items || !items.length) return "-";

  const names = items.slice(0, 2).map((i) => i.productName);

  let result = names.join(", ");

  if (items.length > 2) {
    result += ` +${items.length - 2} lainnya`;
  }

  return result;
};

/* ================= ACTION ================= */
const openDetail = (trx) => {
  selectedTransaction.value = trx;
  showDetail.value = true;
};

const formatCurrency = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val || 0);

/* ================ PAGINATION================== */
const visiblePages = computed(() => {
  const range = 5;
  const start = Math.floor((currentPage.value - 1) / range) * range + 1;
  const end = Math.min(start + range - 1, totalPages.value);

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

/* ================= INIT ================= */
onMounted(fetchTransactions);
watch(currentPage, fetchTransactions);
</script>
<template>
  <DashboardLayout title="History Transaction">
    <div>
      <h1 class="text-2xl font-semibold text-slate-800">Riwayat Transaksi</h1>
      <p class="text-slate-500 text-sm">
        Cari dan temukan informasi riwayat transaksi
      </p>
    </div>
    <div class="space-y-6">
      <!-- CARD TABLE -->
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <!-- HEADER + CONTROL -->
        <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
          <!-- LEFT -->
          <div class="flex gap-4 items-center">
            <div class="p-3 bg-slate-50 border rounded-2xl border-slate-100">
              <!-- ICON -->
              <ArrowLeftRight class="w-5 h-5 text-blue-900" />
            </div>

            <div>
              <h3 class="text-xl font-semibold text-gray-900">
                Transaction History
              </h3>
              <p class="text-sm text-slate-500">
                Monitor all sales transactions
              </p>
            </div>
          </div>

          <!-- RIGHT CONTROL -->
          <div class="flex items-center gap-3 flex-wrap">
            <!-- SEARCH -->
            <div class="relative">
              <Search class="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search trx / customer..."
                class="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <!-- STATUS -->
            <select
              v-model="filters.status"
              class="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="">All Status</option>
              <option value="paid">Lunas</option>
              <option value="unpaid">Belum</option>
              <option value="void">Void</option>
            </select>

            <!-- TYPE -->
            <select
              v-model="filters.type"
              class="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="">All Type</option>
              <option value="sale">Sale</option>
              <option value="manual">Manual</option>
              <option value="inject">Inject</option>
            </select>

            <!-- FILTER BUTTON -->
            <button
              @click="fetchTransactions"
              class="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800"
            >
              Apply
            </button>

            <!-- BULK DELETE -->
            <button
              v-if="selectedIds.length"
              @click="bulkDelete"
              class="inline-flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 text-sm text-red-700"
            >
              Delete ({{ selectedIds.length }})
            </button>
          </div>
        </div>

        <!-- TABLE -->
        <div class="border border-gray-200 rounded-xl overflow-x-auto">
          <table class="w-full text-sm">
            <!-- HEADER -->
            <thead class="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th
                  class="px-4 py-3 w-10 border-r border-gray-100 last:border-r-0"
                >
                  <input
                    type="checkbox"
                    v-model="selectAll"
                    @change="toggleAll"
                  />
                </th>
                <th
                  class="px-4 py-3 text-left font-medium whitespace-nowrap border-r border-gray-100 last:border-r-0"
                >
                  Date
                </th>
                <th
                  class="px-4 py-3 text-left font-medium whitespace-nowrap border-r border-gray-100 last:border-r-0"
                >
                  Trx ID
                </th>
                <th
                  class="px-4 py-3 text-left font-medium min-w-[150px] w-[200px] border-r border-gray-100 last:border-r-0"
                >
                  Produk
                </th>

                <th
                  class="px-4 py-3 text-right font-medium whitespace-nowrap border-r border-gray-100 last:border-r-0"
                >
                  Total
                </th>
                <th
                  class="px-4 py-3 text-right font-medium whitespace-nowrap border-r border-gray-100 last:border-r-0"
                >
                  Profit
                </th>
                <th
                  class="px-4 py-3 text-left font-medium border-r border-gray-100 last:border-r-0"
                >
                  Status
                </th>
                <th
                  class="px-4 py-3 text-right font-medium border-r border-gray-100 last:border-r-0"
                >
                  Action
                </th>
              </tr>
            </thead>

            <!-- BODY -->
            <tbody class="divide-y">
              <template v-if="showSkeleton">
                <!-- SKELETON -->
                <tr v-if="showSkeleton" v-for="i in 15" :key="'skeleton-' + i">
                  <td class="px-4 py-3">
                    <div
                      class="h-4 w-4 bg-gray-200 rounded animate-pulse"
                    ></div>
                  </td>

                  <td class="px-4 py-3">
                    <div
                      class="h-4 w-32 bg-gray-200 rounded animate-pulse"
                    ></div>
                  </td>

                  <td class="px-4 py-3">
                    <div
                      class="h-4 w-24 bg-gray-200 rounded animate-pulse"
                    ></div>
                  </td>

                  <td class="px-4 py-3">
                    <div
                      class="h-4 w-40 bg-gray-200 rounded animate-pulse"
                    ></div>
                  </td>

                  <td class="px-4 py-3 text-right">
                    <div
                      class="h-4 w-20 ml-auto bg-gray-200 rounded animate-pulse"
                    ></div>
                  </td>

                  <td class="px-4 py-3 text-right">
                    <div
                      class="h-4 w-20 ml-auto bg-gray-200 rounded animate-pulse"
                    ></div>
                  </td>

                  <td class="px-4 py-3">
                    <div
                      class="h-4 w-16 bg-gray-200 rounded animate-pulse"
                    ></div>
                  </td>

                  <td class="px-4 py-3 text-right">
                    <div
                      class="h-4 w-12 ml-auto bg-gray-200 rounded animate-pulse"
                    ></div>
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr
                  v-for="trx in transactions"
                  :key="trx.id"
                  class="hover:bg-slate-50 transition cursor-pointer"
                  @click="openDetail(trx)"
                >
                  <td
                    class="px-4 py-3 border-r border-gray-100 last:border-r-0"
                  >
                    <input
                      type="checkbox"
                      :value="trx.id"
                      v-model="selectedIds"
                      @change="toggleOne"
                      @click.stop
                    />
                  </td>
                  <!-- DATE -->
                  <td
                    class="px-4 py-3 text-slate-600 whitespace-nowrap border-r border-gray-100 last:border-r-0"
                  >
                    {{ new Date(trx.createdAt).toLocaleString() }}
                  </td>
                  <!-- TRX -->
                  <td
                    class="px-4 py-3 font-medium text-slate-800 whitespace-nowrap border-r border-gray-100 last:border-r-0"
                  >
                    {{ trx.trxId }}
                  </td>
                  <!-- CUSTOMER -->
                  <td
                    class="px-4 py-3 text-slate-600 min-w-[150px] w-[200px] border-r border-gray-100 last:border-r-0"
                  >
                    {{ formatItems(trx.items) }}
                  </td>

                  <!-- TOTAL -->
                  <td
                    class="px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap border-r border-gray-100 last:border-r-0"
                  >
                    {{ formatCurrency(trx.totalAmount) }}
                  </td>

                  <!-- PROFIT -->
                  <td
                    class="px-4 py-3 text-right font-medium text-green-800 tabular-nums whitespace-nowrap border-r border-gray-100 last:border-r-0"
                  >
                    {{ formatCurrency(trx.totalProfit) }}
                  </td>

                  <!-- STATUS -->
                  <td
                    class="px-4 py-3 border-r border-gray-100 last:border-r-0"
                  >
                    <span
                      class="px-2.5 py-1 text-xs rounded-md font-medium capitalize"
                      :class="{
                        'bg-green-50 text-green-700 border border-green-100':
                          trx.status === 'paid',
                        'bg-orange-100 text-orange-700':
                          trx.status === 'unpaid',
                        'bg-red-100 text-red-700': trx.status === 'void',
                      }"
                    >
                      {{ trx.status }}
                    </span>
                  </td>

                  <!-- ACTION -->
                  <td
                    class="px-4 py-3 text-right border-r border-gray-100 last:border-r-0"
                  >
                    <button
                      @click.stop="openDetail(trx)"
                      class="text-blue-800 hover:text-blue-800 text-xs font-medium"
                    >
                      Detail
                    </button>
                  </td>
                </tr>

                <!-- EMPTY -->
                <tr v-if="!transactions.length && !showSkeleton">
                  <td colspan="8" class="text-center py-6 text-slate-400">
                    Tidak ada data transaksi
                  </td>
                </tr>

                <!-- LOADING -->
                <tr v-if="loading">
                  <td colspan="8" class="text-center py-6 text-slate-400">
                    Loading...
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
          <div class="flex items-center justify-between mt-4 flex-wrap gap-3">
            <!-- INFO -->
            <div class="text-sm text-gray-500">
              Showing
              <span class="font-medium">
                {{ (currentPage - 1) * perPage + 1 }}
              </span>
              -
              <span class="font-medium">
                {{ Math.min(currentPage * perPage, totalData) }}
              </span>
              of
              <span class="font-medium">
                {{ totalData }}
              </span>
              transactions
            </div>

            <!-- CONTROLS -->
            <div class="flex items-center gap-2">
              <!-- PREV -->
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-3 py-1 border rounded-md text-sm disabled:opacity-40"
              >
                Prev
              </button>

              <!-- PAGE -->
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="currentPage = page"
                class="px-3 py-1 border rounded-md text-sm"
                :class="
                  page === currentPage
                    ? 'bg-blue-800 text-white border-blue-800'
                    : 'bg-white'
                "
              >
                {{ page }}
              </button>

              <!-- NEXT -->
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 border rounded-md text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- DRAWER -->
      <TransactionDetailDrawer
        :show="showDetail"
        :transaction="selectedTransaction"
        @close="showDetail = false"
      />
    </div>
  </DashboardLayout>
</template>
