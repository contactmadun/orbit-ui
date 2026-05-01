<script setup>
import { ref, computed, watch, onMounted } from "vue";
import api from "@/axios";
import DashboardLayout from "@/components/reusable/DashboardLayout.vue";
import AddFundAccountDrawer from "@/components/reusable/AddFundAccountDrawer.vue";
import TransferBalanceDrawer from "@/components/reusable/TransferBalanceDrawer.vue";
import TopupDrawer from "@/components/reusable/TopupDrawer.vue";
import WithdrawDrawer from "@/components/reusable/WithdrawDrawer.vue";
import {
  Landmark,
  Wallet,
  ArrowLeftRight,
  Plus,
  CreditCard,
  ArrowUpRight,
} from "lucide-vue-next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* outlet filter */
const outletFilter = ref("all");
const outletFilterTransaction = ref("all");
const showAddAccount = ref(false);
const showTransfer = ref(false);
const selectedIds = ref([]);
const selectAll = ref(false);
const transferLoading = ref(false);
const transactions = ref([]);
const transferPrefill = ref(null);
const showTopup = ref(false);
const showWithdraw = ref(false);
const withdrawPrefill = ref(null);

const openAddAccount = () => {
  showAddAccount.value = true;
};
const openTransfer = () => {
  showTransfer.value = true;
};

const toggleAll = () => {
  if (selectAll.value) {
    selectedIds.value = filteredTransactions.value.map((t) => t.id);
  } else {
    selectedIds.value = [];
  }
};

const openTopup = () => {
  showTopup.value = true;
};

const openWithdrawFromCard = () => {
  if (!activeAccount.value) return;

  withdrawPrefill.value = {
    outletId: String(activeAccount.value.outlet),
    accountId: String(activeAccount.value.id),
  };

  showWithdraw.value = true;
};

const handleWithdraw = async (payload) => {
  try {
    await api.post("/fund/withdraw", {
      outletId: Number(payload.outletId),
      accountId: Number(payload.accountId),
      amount: Number(payload.amount),
      note: payload.note,
    });

    await fetchAccounts();
    await fetchTransactions();

    showWithdraw.value = false;
  } catch (err) {
    console.error("Withdraw gagal:", err);
  }
};

const handleTopup = async (payload) => {
  try {
    await api.post("/fund/topup", {
      outletId: Number(payload.outletId),
      accountId: Number(payload.accountId),
      amount: Number(payload.amount),
      note: payload.note,
    });

    await fetchAccounts();
    await fetchTransactions();

    showTopup.value = false;
  } catch (err) {
    console.error("Topup gagal:", err);
  }
};

const outlets = ref([{ id: "all", name: "All Outlet" }]);

/* accounts */
const accounts = ref([]);

const fetchOutlets = async () => {
  try {
    const res = await api.get("/outlet");

    const outletList = res.data.data;

    outlets.value = [
      { id: "all", name: "All Outlet" },
      ...outletList.map((o) => ({
        id: o.id,
        name: o.name,
      })),
    ];
  } catch (err) {
    console.error("Failed load outlets", err);
  }
};

const fetchAccounts = async () => {
  try {
    const res = await api.get("/fund", {
      params: {
        outletId: outletFilter.value,
      },
    });

    const fundList = res.data?.data || [];

    accounts.value = fundList.map((acc) => ({
      id: acc.id,
      name: acc.nameAccount,
      bank: acc.nameBank,
      number: acc.accountNumber,
      type: acc.type,
      balance: acc.balance,
      outlet: acc.outletId,
      outletName: acc.outlet?.name || "-",
    }));
  } catch (err) {
    console.error("Failed load accounts", err);
  }
};

const handleCloseTransfer = () => {
  showTransfer.value = false;
  transferPrefill.value = null;
};

const handleTransfer = async (payload) => {
  if (transferLoading.value) return;

  transferLoading.value = true;

  try {
    await api.post("/fund/transfer", {
      outletId: Number(payload.outletId),
      fromAccountId: Number(payload.fromAccountId),
      toAccountId: Number(payload.toAccountId),
      amount: Number(payload.amount),
      fee: Number(payload.fee || 0),
      note: payload.note,
    });

    await fetchAccounts();
    await fetchTransactions();
    showTransfer.value = false;
  } catch (err) {
    console.error(err);
  } finally {
    transferLoading.value = false;
  }
};

const openTransferFromCard = () => {
  if (!activeAccount.value) return;

  transferPrefill.value = {
    outletId: String(activeAccount.value.outlet),
    fromAccountId: String(activeAccount.value.id),
  };

  showTransfer.value = true;
};

const fetchTransactions = async () => {
  const res = await api.get("/fund/recent-transaction", {
    params: {
      outletId: outletFilter.value,
    },
  });

  transactions.value = res.data.data;
};

/* filter account */
const filteredAccounts = computed(() => {
  if (outletFilter.value === "all") return accounts.value;
  return accounts.value.filter(
    (a) => String(a.outlet) === String(outletFilter.value),
  );
});

/* active card */
const activeIndex = ref(0);

/* reset index when filter change */
watch(outletFilter, () => {
  fetchAccounts();
});

watch(selectedIds, () => {
  const total = filteredTransactions.value.length;
  selectAll.value = selectedIds.value.length === total;
});

/* navigation */
const nextCard = () => {
  activeIndex.value = (activeIndex.value + 1) % filteredAccounts.value.length;
};

const prevCard = () => {
  activeIndex.value =
    (activeIndex.value - 1 + filteredAccounts.value.length) %
    filteredAccounts.value.length;
};

/* active account */
const activeAccount = computed(() => {
  const list = filteredAccounts.value;

  if (!list.length) return null;

  if (activeIndex.value > list.length - 1) {
    activeIndex.value = 0;
  }

  return list[activeIndex.value];
});

/* stats */
const totalBalance = computed(() =>
  filteredAccounts.value.reduce((sum, a) => sum + a.balance, 0),
);

const totalBank = computed(
  () => filteredAccounts.value.filter((a) => a.type === "bank").length,
);

const totalCash = computed(
  () => filteredAccounts.value.filter((a) => a.type === "cash").length,
);

/* helper */
const formatCurrency = (val) => {
  return "Rp " + Number(val).toLocaleString();
};

const formatDate = (val) => {
  if (!val) return "-";

  return new Date(val).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const filteredTransactions = computed(() => {
  if (outletFilterTransaction.value === "all") {
    return transactions.value;
  }

  return transactions.value.filter(
    (t) => String(t.outletId) === String(outletFilterTransaction.value),
  );
});

onMounted(() => {
  fetchOutlets();
  fetchAccounts();
  fetchTransactions();
});
</script>

<template>
  <DashboardLayout title="Bank Accounts">
    <div class="space-y-6">
      <!-- HEADER -->
      <div class="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Bank Accounts</h1>
          <p class="text-sm text-gray-500">
            Manage fund sources for POS transactions
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- OUTLET FILTER -->
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
            @click="openAddAccount"
            class="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 text-sm"
          >
            <Plus class="w-4 h-4" />
            Add Account
          </button>

          <button
            @click="openTransfer"
            class="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 text-sm"
          >
            <ArrowLeftRight class="w-4 h-4" />
            Transfer Balance
          </button>

          <button
            @click="openTopup"
            class="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 text-sm"
          >
            <ArrowUpRight class="w-4 h-4" />
            Topup
          </button>
        </div>
      </div>

      <!-- SUMMARY -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- TOTAL BALANCE -->
        <div class="bg-white border rounded-lg p-5">
          <div class="flex gap-2 items-center mb-2">
            <div
              class="w-8 h-8 bg-slate-100 text-blue-900 rounded-lg flex items-center justify-center"
            >
              <Wallet class="w-4 h-4" />
            </div>

            <p class="text-base font-semibold text-slate-800">Total Balance</p>
          </div>

          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <h2 class="text-2xl text-slate-800 font-bold">
                {{ formatCurrency(totalBalance) }}
              </h2>
            </div>

            <!-- SPARKLINE -->
            <svg
              viewBox="0 0 100 40"
              class="w-16 h-8 text-blue-600"
              fill="none"
            >
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
            Total saldo dari seluruh akun kas dan bank.
          </p>
        </div>

        <!-- BANK ACCOUNTS -->
        <div class="bg-white border rounded-lg p-5">
          <div class="flex gap-2 items-center mb-2">
            <div
              class="w-8 h-8 bg-slate-100 text-indigo-900 rounded-lg flex items-center justify-center"
            >
              <Landmark class="w-4 h-4" />
            </div>

            <p class="text-base font-semibold text-slate-800">Bank Accounts</p>
          </div>

          <div class="flex items-baseline mb-2 gap-1">
            <h2 class="text-2xl text-slate-800 font-bold">
              {{ totalBank }}
            </h2>
            <p class="text-sm">Akun Bank</p>
          </div>

          <p class="text-sm text-slate-600">
            Jumlah rekening bank yang terhubung di sistem.
          </p>
        </div>

        <!-- CASH ACCOUNTS -->
        <div class="bg-white border rounded-lg p-5">
          <div class="flex gap-2 items-center mb-2">
            <div
              class="w-8 h-8 bg-slate-100 text-green-900 rounded-lg flex items-center justify-center"
            >
              <Wallet class="w-4 h-4" />
            </div>

            <p class="text-base font-semibold text-slate-800">Cash Accounts</p>
          </div>

          <div class="flex items-baseline mb-2 gap-1">
            <h2 class="text-2xl text-slate-800 font-bold">
              {{ totalCash }}
            </h2>
            <p class="text-sm">Akun Kas</p>
          </div>

          <p class="text-sm text-slate-600">
            Akun kas yang digunakan untuk transaksi harian.
          </p>
        </div>
      </div>

      <!-- ACCOUNT LIST -->
      <div class="bg-white border border-gray-200 rounded-xl px-6 pt-6 pb-10">
        <div class="flex gap-4 items-center">
          <div class="p-3 bg-slate-50 border rounded-2xl border-slate-100">
            <CreditCard class="w-5 h-5 text-blue-900" />
          </div>

          <div>
            <h3 class="text-xl font-semibold text-gray-900">Akun Bank</h3>
            <p class="text-sm text-slate-500">
              Manage akun bank, topup atau transfer
            </p>
          </div>
        </div>
        <div class="grid lg:grid-cols-2 gap-8 items-center">
          <!-- LEFT : SUMMARY -->
          <div>
            <p class="text-sm text-gray-500 mb-2">Total Balance</p>

            <h2 class="text-4xl font-bold text-gray-900 mb-4">
              {{
                activeAccount ? formatCurrency(activeAccount.balance) : "Rp 0"
              }}
            </h2>

            <p class="text-xs text-teal-700 mb-6">+9.7% vs last month</p>

            <div class="flex gap-3">
              <button
                @click="openTransferFromCard"
                class="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800"
              >
                Transfer
              </button>

              <button
                @click="openWithdrawFromCard"
                class="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                Withdraw
              </button>
            </div>
          </div>

          <!-- RIGHT : CARD STACK -->
          <div class="relative flex justify-center">
            <!-- CARD STACK -->
            <div class="relative w-80 h-48">
              <div
                v-for="(acc, i) in filteredAccounts"
                :key="acc.id"
                class="absolute w-full h-full rounded-xl p-5 text-white transition-all duration-500"
                :style="{
                  transform: `translateY(${(i - activeIndex) * 12}px) scale(${1 - Math.abs(i - activeIndex) * 0.06})`,
                  opacity:
                    i === activeIndex
                      ? 1
                      : 1 - Math.abs(i - activeIndex) * 0.25,
                  zIndex: 100 - Math.abs(i - activeIndex),
                }"
                :class="
                  i === activeIndex ? 'bg-teal-700 shadow-xl' : 'bg-teal-600'
                "
              >
                <div class="flex justify-between items-start mb-6">
                  <p class="font-semibold text-lg">
                    {{ acc.bank }}
                  </p>

                  <span class="text-xs opacity-70">
                    {{ acc.outletName }}
                  </span>
                </div>

                <p class="text-lg tracking-widest mb-6">
                  {{ acc.number }}
                </p>

                <div class="flex justify-between text-xs opacity-80">
                  <span>{{ acc.name }}</span>
                  <span class="capitalize">{{ acc.type }}</span>
                </div>
              </div>
            </div>

            <!-- NAV BUTTON -->
            <button
              @click="prevCard"
              class="absolute left-0 top-1/2 -translate-y-1/2 bg-white border rounded-full w-8 h-8 shadow flex items-center justify-center"
            >
              ‹
            </button>

            <button
              @click="nextCard"
              class="absolute right-0 top-1/2 -translate-y-1/2 bg-white border rounded-full w-8 h-8 shadow flex items-center justify-center"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <!-- TRANSACTION HISTORY -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6">
        <!-- HEADER -->
        <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div class="flex gap-4 items-center">
            <div class="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
              <ArrowLeftRight class="w-5 h-5 text-slate-700" />
            </div>

            <div>
              <h3 class="text-xl font-semibold text-gray-900">
                Recent Transactions
              </h3>
              <p class="text-sm text-slate-500">
                Latest account balance movements across outlets
              </p>
            </div>
          </div>

          <!-- FILTER OUTLET -->
          <Select v-model="outletFilterTransaction">
            <SelectTrigger class="w-[180px] bg-white">
              <SelectValue placeholder="Filter Outlet" />
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
        </div>

        <!-- TABLE -->
        <div class="border border-gray-200 rounded-xl overflow-x-auto">
          <table class="w-full text-sm">
            <!-- HEADER -->
            <thead class="bg-slate-50 border-b text-slate-500">
              <tr>
                <!-- BULK CHECK -->
                <th class="px-4 py-3 border-r w-10">
                  <input
                    type="checkbox"
                    v-model="selectAll"
                    @change="toggleAll"
                  />
                </th>

                <th
                  class="px-4 py-3 text-left font-medium border-r whitespace-nowrap"
                >
                  Date
                </th>
                <th
                  class="px-4 py-3 text-left font-medium border-r whitespace-nowrap"
                >
                  Outlet
                </th>
                <th
                  class="px-4 py-3 text-left font-medium border-r whitespace-nowrap"
                >
                  Account
                </th>
                <th
                  class="px-4 py-3 text-left font-medium border-r whitespace-nowrap"
                >
                  To Account
                </th>

                <th class="px-4 py-3 text-left font-medium border-r">
                  Reference
                </th>
                <th class="px-4 py-3 text-left font-medium border-r">Note</th>

                <th
                  class="px-4 py-3 text-right font-medium border-r whitespace-nowrap"
                >
                  Admin
                </th>
                <th class="px-4 py-3 text-right font-medium whitespace-nowrap">
                  Amount
                </th>
              </tr>
            </thead>

            <!-- BODY -->
            <tbody class="divide-y">
              <tr
                v-for="trx in filteredTransactions"
                :key="trx.id"
                class="hover:bg-slate-50 transition"
              >
                <!-- CHECKBOX -->
                <td class="px-4 py-3 border-r">
                  <input
                    type="checkbox"
                    v-model="selectedIds"
                    :value="trx.id"
                  />
                </td>

                <!-- DATE -->
                <td class="px-4 py-3 text-slate-600 border-r whitespace-nowrap">
                  {{ formatDate(trx.date) }}
                </td>

                <!-- OUTLET -->
                <td class="px-4 py-3 text-slate-600 border-r whitespace-nowrap">
                  {{ trx.outlet }}
                </td>

                <!-- ACCOUNT -->
                <td
                  class="px-4 py-3 font-medium text-slate-800 border-r whitespace-nowrap"
                >
                  {{ trx.account }}
                </td>

                <!-- TO ACCOUNT -->
                <td class="px-4 py-3 text-slate-600 border-r whitespace-nowrap">
                  {{ trx.toAccount || "-" }}
                </td>

                <!-- REFERENCE (boleh wrap) -->
                <td class="px-4 py-3 text-slate-600 border-r whitespace-nowrap">
                  {{ trx.reference }}
                </td>

                <!-- NOTE (boleh wrap) -->
                <td class="px-4 py-3 text-slate-600 border-r whitespace-nowrap">
                  {{ trx.note || "-" }}
                </td>

                <!-- ADMIN -->
                <td
                  class="px-4 py-3 text-right text-slate-600 border-r tabular-nums whitespace-nowrap"
                >
                  <span v-if="trx.admin">
                    {{ formatCurrency(trx.admin) }}
                  </span>
                  <span v-else class="text-slate-400">-</span>
                </td>

                <!-- AMOUNT -->
                <td
                  class="px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap"
                  :class="
                    trx.type === 'transfer'
                      ? 'text-red-600'
                      : trx.type === 'withdraw'
                        ? 'text-red-600'
                        : trx.type === 'topup'
                          ? 'text-green-600'
                          : 'text-slate-900'
                  "
                >
                  {{
                    trx.type === "transfer" || trx.type === "withdraw"
                      ? "-"
                      : "+"
                  }}
                  {{ formatCurrency(trx.amount) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <AddFundAccountDrawer
      :show="showAddAccount"
      @close="showAddAccount = false"
      @saved="fetchAccounts"
    />
    <TransferBalanceDrawer
      :show="showTransfer"
      :outlets="outlets"
      :accounts="accounts"
      :prefill="transferPrefill"
      @close="handleCloseTransfer"
      @submit="handleTransfer"
    />
    <TopupDrawer
      :show="showTopup"
      :outlets="outlets"
      :accounts="accounts"
      @close="showTopup = false"
      @submit="handleTopup"
    />
    <WithdrawDrawer
      :show="showWithdraw"
      :outlets="outlets"
      :accounts="accounts"
      :prefill="withdrawPrefill"
      @close="showWithdraw = false"
      @submit="handleWithdraw"
    />
  </DashboardLayout>
</template>
