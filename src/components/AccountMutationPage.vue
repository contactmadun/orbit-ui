<script setup>
import { ref, onMounted, watch, computed } from "vue";
import api from "@/axios";
import DashboardLayout from "@/components/reusable/DashboardLayout.vue";
import { Search, ArrowLeftRight } from "lucide-vue-next";

/* ================= STATE ================= */
const mutations = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const perPage = ref(30);
const totalData = ref(0);
const totalPages = ref(1);
const showSkeleton = ref(true);

const filters = ref({
  search: "",
  type: "",
  source: "",
  startDate: "",
  endDate: "",
});

/* ================= BULK ================= */
const selectedIds = ref([]);
const selectAll = ref(false);

const toggleAll = () => {
  if (selectAll.value) {
    selectedIds.value = mutations.value.map((m) => m.id);
  } else {
    selectedIds.value = [];
  }
};

const toggleOne = () => {
  selectAll.value = selectedIds.value.length === mutations.value.length;
};

/* ================= FETCH ================= */
const fetchMutations = async () => {
  loading.value = true;
  showSkeleton.value = true;

  try {
    const res = await api.get("/finance/mutation", {
      params: {
        ...filters.value,
        page: currentPage.value,
        limit: perPage.value,
      },
    });

    mutations.value = res.data.data;
    totalData.value = res.data.pagination.total;
    totalPages.value = res.data.pagination.totalPages;
  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(() => {
      loading.value = false;
      showSkeleton.value = false;
    }, 500);
  }
};

/* ================= FORMAT ================= */
const formatCurrency = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val || 0);

/* ================= PAGINATION ================= */
const visiblePages = computed(() => {
  const range = 5;
  const start = Math.floor((currentPage.value - 1) / range) * range + 1;
  const end = Math.min(start + range - 1, totalPages.value);

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

/* ================= INIT ================= */
onMounted(fetchMutations);
watch(currentPage, fetchMutations);
</script>
<template>
  <DashboardLayout title="Account Mutation">
    <div>
      <h1 class="text-2xl font-semibold text-slate-800">Mutasi Rekening</h1>
      <p class="text-slate-500 text-sm">Monitor semua pergerakan saldo akun</p>
    </div>

    <div class="space-y-6">
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <!-- HEADER -->
        <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div class="flex gap-4 items-center">
            <div class="p-3 bg-slate-50 border rounded-2xl border-slate-100">
              <ArrowLeftRight class="w-5 h-5 text-blue-900" />
            </div>

            <div>
              <h3 class="text-xl font-semibold text-gray-900">
                Account Mutation
              </h3>
              <p class="text-sm text-slate-500">
                Track all account balance changes
              </p>
            </div>
          </div>

          <!-- FILTER -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="relative">
              <Search class="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search reference..."
                class="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>

            <select
              v-model="filters.type"
              class="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">All Type</option>
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>

            <select
              v-model="filters.source"
              class="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">All Source</option>
              <option value="pos">POS</option>
              <option value="manual">Manual</option>
              <option value="system">System</option>
              <option value="finance">Finance</option>
            </select>

            <button
              @click="fetchMutations"
              class="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm"
            >
              Apply
            </button>
          </div>
        </div>

        <!-- TABLE -->
        <div class="border border-gray-200 rounded-xl overflow-x-auto">
          <table class="w-full text-sm">
            <!-- HEADER -->
            <thead class="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th class="px-4 py-3 w-10 border-r">
                  <input
                    type="checkbox"
                    v-model="selectAll"
                    @change="toggleAll"
                  />
                </th>
                <th
                  class="px-4 py-3 text-left border-r whitespace-nowrap w-[180px]"
                >
                  Date
                </th>
                <th class="px-4 py-3 text-left border-r">Account</th>
                <th class="px-4 py-3 text-left border-r">Type</th>
                <th class="px-4 py-3 text-right border-r">Amount</th>
                <th class="px-4 py-3 text-right border-r">Before</th>
                <th class="px-4 py-3 text-right border-r">After</th>
                <th class="px-4 py-3 text-left border-r">Source</th>
                <th class="px-4 py-3 text-left border-r">Note</th>
              </tr>
            </thead>

            <!-- BODY -->
            <tbody class="divide-y">
              <!-- SKELETON -->
              <template v-if="showSkeleton">
                <tr v-for="i in 10" :key="i">
                  <td class="px-4 py-3">
                    <div class="h-4 w-4 bg-gray-200 animate-pulse" />
                  </td>
                  <td class="px-4 py-3">
                    <div class="h-4 w-32 bg-gray-200 animate-pulse" />
                  </td>
                  <td class="px-4 py-3">
                    <div class="h-4 w-24 bg-gray-200 animate-pulse" />
                  </td>
                  <td class="px-4 py-3">
                    <div class="h-4 w-16 bg-gray-200 animate-pulse" />
                  </td>
                  <td class="px-4 py-3">
                    <div class="h-4 w-20 bg-gray-200 animate-pulse ml-auto" />
                  </td>
                  <td class="px-4 py-3">
                    <div class="h-4 w-20 bg-gray-200 animate-pulse ml-auto" />
                  </td>
                  <td class="px-4 py-3">
                    <div class="h-4 w-20 bg-gray-200 animate-pulse ml-auto" />
                  </td>
                  <td class="px-4 py-3">
                    <div class="h-4 w-20 bg-gray-200 animate-pulse" />
                  </td>
                  <td class="px-4 py-3">
                    <div class="h-4 w-20 bg-gray-200 animate-pulse" />
                  </td>
                </tr>
              </template>

              <!-- DATA -->
              <template v-else>
                <tr
                  v-for="m in mutations"
                  :key="m.id"
                  class="hover:bg-slate-50"
                >
                  <td class="px-4 py-3 border-r">
                    <input
                      type="checkbox"
                      :value="m.id"
                      v-model="selectedIds"
                      @change="toggleOne"
                    />
                  </td>

                  <td class="px-4 py-3 border-r whitespace-nowrap w-[180px]">
                    {{ new Date(m.createdAt).toLocaleString() }}
                  </td>

                  <td class="px-4 py-3 border-r">
                    {{ m.account?.nameBank || "-" }}
                  </td>

                  <td class="px-4 py-3 border-r">
                    <span
                      :class="
                        m.type === 'credit' ? 'text-green-700' : 'text-red-700'
                      "
                    >
                      {{ m.type }}
                    </span>
                  </td>

                  <td class="px-4 py-3 text-right border-r font-medium">
                    {{ formatCurrency(m.amount) }}
                  </td>

                  <td class="px-4 py-3 text-right border-r">
                    {{ formatCurrency(m.balanceBefore) }}
                  </td>

                  <td class="px-4 py-3 text-right border-r">
                    {{ formatCurrency(m.balanceAfter) }}
                  </td>

                  <td class="px-4 py-3 border-r">
                    {{ m.source }}
                  </td>

                  <td class="px-4 py-3 border-r border-gray-100 max-w-[200px]">
                    <div class="truncate" :title="m.note">
                      {{ m.note || "-" }}
                    </div>
                  </td>
                </tr>

                <!-- EMPTY -->
                <tr v-if="!mutations.length">
                  <td colspan="9" class="text-center py-6 text-slate-400">
                    Tidak ada data
                  </td>
                </tr>
              </template>
            </tbody>
          </table>

          <!-- PAGINATION -->
          <div class="flex justify-between mt-4">
            <div class="text-sm text-gray-500">
              Showing {{ (currentPage - 1) * perPage + 1 }}
              -
              {{ Math.min(currentPage * perPage, totalData) }}
              of {{ totalData }}
            </div>

            <div class="flex gap-2">
              <button @click="currentPage--" :disabled="currentPage === 1">
                Prev
              </button>

              <button
                v-for="p in visiblePages"
                :key="p"
                @click="currentPage = p"
              >
                {{ p }}
              </button>

              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
