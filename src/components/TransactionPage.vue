<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import api from "@/axios";
import {
  ShoppingCart,
  Smartphone,
  ArrowLeftRight,
  Banknote,
  Search,
  Package,
  Expand,
  Shrink,
} from "lucide-vue-next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CartDrawer from "@/components/reusable/CartDrawer.vue";
import CloseCashierDrawer from "@/components/reusable/CloseCashierDrawer.vue";
import { useRouter } from "vue-router";
import { useFullscreen } from "@/composable/useFullscreen";

/* ========================= STATE ========================= */
let debounceTimer = null;
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024;
};
const mobileLoadingMore = ref(false);
const mobileFinished = ref(false);
const viewMode = ref("table"); // 'table' | 'card'
const showCustomer = ref(false);
const showDiscount = ref(false);
const showPaymentDialog = ref(false);
const showCloseCashier = ref(false);
const cashierBalances = ref([]);
const loadingClose = ref(false);
const activeTab = ref("product");
const priceType = ref("retail");
const search = ref("");
const loadingProducts = ref(false);
const cart = ref([]);
const showCartModal = ref(false);
const selectedIds = ref([]);
const currentPage = ref(1);
const limit = ref(10);
const loadingPay = ref(false);
const pagination = ref({
  total: 0,
  totalPages: 1,
});
const increaseQty = (p) => {
  addToCart(p);
};
const funds = ref([]);
const loadingFunds = ref(false);
const { isFullscreen } = useFullscreen();
const router = useRouter();

const currentViewMode = computed(() => {
  return isMobile.value ? "card" : viewMode.value;
});

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

const checkActiveSession = async () => {
  try {
    const res = await api.get("/cashier/session");

    if (!res.data.data) {
      // 🔥 kalau tidak ada session → lempar ke open
      router.replace("/pos/open-session");
    }
  } catch (err) {
    console.error(err);
    router.replace("/pos/open-session");
  }
};

// Section Closing Cashier
const fetchCashierBalances = async () => {
  try {
    const res = await api.get("/cashier/balance");

    cashierBalances.value = res.data.data.map((b) => ({
      ...b,

      // ❌ JANGAN isi dari system
      // closingBalance: b.systemBalance || 0,

      // ✅ HARUS NULL / EMPTY
      closingBalance: null,
    }));
  } catch (err) {
    console.error(err);
  }
};

const openCloseCashier = async () => {
  await fetchCashierBalances();
  showCloseCashier.value = true;
};

const submitCloseCashier = async (payload) => {
  loadingClose.value = true;

  try {
    await api.post("/cashier/close", payload);

    alert("Kasir berhasil ditutup");

    showCloseCashier.value = false;

    // 🔥 refresh state (optional tapi penting)
    router.replace("/pos/open-session");
  } catch (err) {
    console.error(err);
    alert("Gagal tutup kasir");
  } finally {
    loadingClose.value = false;
  }
};

const fetchFunds = async () => {
  loadingFunds.value = true;
  try {
    const res = await api.get("/fund/pos"); // 🔥 clean
    funds.value = res.data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loadingFunds.value = false;
  }
};

const FundExcludeCash = computed(() =>
  funds.value.filter(
    (f) => f.type !== "cash" && !f.isDefault, // 🔥 exclude kas utama
  ),
);

const withdraw = ref({
  amount: 0,
  admin: 0,
  isAdminIncluded: false, // 🔥 switch
  fundTarget: "",
  notes: "",
});

const withdrawCashOut = computed(() => {
  const amount = Number(withdraw.value.amount || 0);
  const admin = Number(withdraw.value.admin || 0);

  // 🔥 admin di dalam → kas keluar full
  if (withdraw.value.isAdminIncluded) {
    return amount;
  }

  // 🔥 admin dipotong → kas keluar lebih kecil
  return amount - admin;
});

const withdrawFundIn = computed(() => {
  const amount = Number(withdraw.value.amount || 0);
  const admin = Number(withdraw.value.admin || 0);

  // 🔥 admin di dalam → saldo masuk lebih besar
  if (withdraw.value.isAdminIncluded) {
    return amount + admin;
  }

  return amount;
});

const handleAfterPay = (data) => {
  // 🔥 hanya handle hasil, JANGAN call API lagi

  cart.value = [];

  payment.value = {
    amountPaid: 0,
    method: "",
    status: "paid",
    customerName: "",
    fundSource: "",
  };

  showCartModal.value = false;
};

const handlePay = async () => {
  if (loadingPay.value) return;

  // 🔥 VALIDASI
  if (isInject.value && !payment.value.fundSource) {
    alert("Sumber dana wajib dipilih");
    return;
  }

  if (payment.value.status === "paid") {
    if (!payment.value.method) {
      alert("Metode pembayaran wajib dipilih");
      return;
    }

    if ((payment.value.amountPaid || 0) < finalTotal.value) {
      alert("Uang bayar kurang");
      return;
    }
  }

  if (payment.value.status === "unpaid" && !payment.value.customerName) {
    alert("Nama pelanggan wajib diisi");
    return;
  }

  // 🔥 PAYLOAD SAMA PERSIS DENGAN CART DRAWER
  const payload = {
    cart: cart.value.map((item) => ({
      id: item.id,
      name: item.name,
      qty: Number(item.qty),
      price: Number(item.price),
      costPrice: Number(item.costPrice || 0),
      type: item.type,
    })),

    totalAmount: Number(finalTotal.value),
    isInject: isInject.value,

    payment: {
      status: payment.value.status,
      method: payment.value.method || null,
      amountPaid: Number(payment.value.amountPaid) || 0,
      customerName: payment.value.customerName || null,
      fundSource: payment.value.fundSource || null,
    },

    change: change.value,
  };

  try {
    loadingPay.value = true;

    console.log("SEND API:", payload);

    await api.post("/sale", payload);

    alert("Transaksi berhasil");

    // 🔥 RESET STATE
    cart.value = [];
    payment.value = {
      amountPaid: 0,
      method: "",
      status: "paid",
      customerName: "",
      fundSource: "",
    };

    showPaymentDialog.value = false;
    showCartModal.value = false;
  } catch (err) {
    console.error(err);
    alert(err?.response?.data?.message || "Gagal transaksi");
  } finally {
    loadingPay.value = false;
  }
};

const handleWithdrawSubmit = async () => {
  try {
    await api.post("/sale/withdraw", {
      withdraw: withdraw.value,
    });

    // reset
    withdraw.value = {
      amount: 0,
      admin: 0,
      isAdminIncluded: false,
      fundTarget: "",
      notes: "",
    };

    alert("Transaksi berhasil");
  } catch (err) {
    console.error(err);
    alert("Gagal transaksi");
  }
};

const transfer = ref({
  amount: 0,
  adminBank: 0,
  adminCustomer: 0,
  fundSource: "",
  status: "paid",
  customerName: "",
  customerPhone: "",
  notes: "",
});

const totalReceive = computed(() => {
  return (
    Number(transfer.value.amount || 0) +
    Number(transfer.value.adminCustomer || 0)
  );
});

const totalDebit = computed(() => {
  return (
    Number(transfer.value.amount || 0) + Number(transfer.value.adminBank || 0)
  );
});

const handleTransferSubmit = async () => {
  try {
    await api.post("/sale/transfer", {
      transfer: transfer.value,
    });

    // reset
    transfer.value = {
      amount: 0,
      adminBank: 0,
      adminCustomer: 0,
      fundSource: "",
      status: "paid",
      customerName: "",
      customerPhone: "",
      notes: "",
    };

    alert("Transaksi berhasil");
  } catch (err) {
    console.error(err);
    alert("Gagal transaksi");
  }
};

const manual = ref({
  price: 0,
  cost: 0,
  status: "paid", // default
  customerName: "",
  customerPhone: "",
  fundSource: "",
  notes: "",
});

const handleManualSubmit = async () => {
  try {
    await api.post("/sale/manual", {
      manual: manual.value,
    });

    // reset
    manual.value = {
      price: 0,
      cost: 0,
      status: "paid",
      customerName: "",
      customerPhone: "",
      fundSource: "",
      notes: "",
    };

    alert("Transaksi berhasil");
  } catch (err) {
    console.error(err);
    alert("Gagal transaksi");
  }
};

const openPayment = () => {
  if (isFullscreen.value) {
    showPaymentDialog.value = true;
  } else {
    showCartModal.value = true;
  }
};

const decreaseQty = (p) => {
  const item = getCartItem(p.id);
  if (!item) return;

  if (item.qty > 1) {
    item.qty--;
  } else {
    cart.value = cart.value.filter((i) => i.id !== p.id);
  }
};

const payment = ref({
  amountPaid: 0,
  method: "cash",
  status: "paid", // 🔥 default
  customerName: "",
  fundSource: "",
});

/* ========================= MENU ========================= */
const menus = [
  { name: "Produk", value: "product", icon: ShoppingCart },
  { name: "Manual", value: "manual", icon: Smartphone },
  { name: "Transfer", value: "transfer", icon: ArrowLeftRight },
  { name: "Tarik Tunai", value: "withdraw", icon: Banknote },
];

const changeTab = (val) => (activeTab.value = val);
const isActive = (menu) => activeTab.value === menu.value;

/* ========================= DATA ========================= */
const products = ref([]);

const totalAmount = computed(() =>
  cart.value.reduce((sum, i) => sum + i.qty * i.price, 0),
);

const totalQty = computed(() => cart.value.reduce((sum, i) => sum + i.qty, 0));

const change = computed(() => {
  return payment.value.amountPaid - finalTotal.value;
});

/* ========================= API ========================= */
async function fetchProducts() {
  try {
    if (currentPage.value === 1) {
      loadingProducts.value = true;
    }

    const res = await api.get("/products", {
      params: {
        search: search.value,
        page: currentPage.value,
        limit: limit.value,
      },
    });

    const newData = res.data.data || [];

    if (currentViewMode.value === "card" && currentPage.value > 1) {
      products.value.push(...newData);
    } else {
      products.value = newData;
    }

    pagination.value = res.data.pagination;

    mobileFinished.value = currentPage.value >= res.data.pagination.totalPages;
  } catch (err) {
    console.error(err);
  } finally {
    loadingProducts.value = false;
  }
}

const handleMobileScroll = async () => {
  if (currentViewMode.value !== "card") return;

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  const windowHeight = window.innerHeight;

  const fullHeight = document.documentElement.scrollHeight;

  const nearBottom = scrollTop + windowHeight >= fullHeight - 200;

  console.log("SCROLL", {
    scrollTop,
    windowHeight,
    fullHeight,
    nearBottom,
  });

  if (
    nearBottom &&
    !mobileLoadingMore.value &&
    !mobileFinished.value &&
    !loadingProducts.value
  ) {
    mobileLoadingMore.value = true;

    try {
      currentPage.value++;

      // minimum loading time
      await Promise.all([
        fetchProducts(),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);
    } finally {
      mobileLoadingMore.value = false;
    }
  }
};

/* ========================= METHODS ========================= */
const getPrice = (p) =>
  priceType.value === "retail"
    ? p.retailPrice || p.retail
    : p.wholesalePrice || p.wholesale;

const getCartItem = (id) => cart.value.find((i) => i.id === id);

const addToCart = (p) => {
  const existing = getCartItem(p.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.value.push({
      id: p.id,
      name: p.name || p.productName,
      price: getPrice(p),
      costPrice: p.costPrice || p.cost || 0, // 🔥 TAMBAH INI
      qty: 1,
      type: p.typeProduct,
    });
  }
};

// Script Dialog
// ================= DISCOUNT =================
const discount = ref({
  type: "nominal",
  value: 0,
});

const finalTotal = computed(() => {
  let total = Number(totalAmount.value) || 0;

  if (discount.value.value > 0) {
    if (discount.value.type === "percent") {
      total -= (total * discount.value.value) / 100;
    } else {
      total -= discount.value.value;
    }
  }

  return total < 0 ? 0 : total;
});

const paymentMethods = computed(() => {
  const types = funds.value.map((f) => f.type);
  return [...new Set(types)];
});

const injectFunds = computed(() =>
  funds.value.filter((f) => f.type !== "cash" && !f.isDefault),
);

const suggestedAmounts = computed(() => {
  const total = finalTotal.value || 0;
  if (!total) return [];

  const bases = [1000, 2000, 5000, 10000, 20000, 50000, 100000];
  const suggestions = new Set();

  bases.forEach((base) => {
    const rounded = Math.ceil(total / base) * base;
    suggestions.add(rounded);
  });

  suggestions.add(total);
  suggestions.add(Math.ceil(total / 1000) * 1000);

  return Array.from(suggestions)
    .filter((v) => v >= total)
    .sort((a, b) => a - b)
    .slice(0, 5);
});

const customers = ref([]);
const searchCustomer = ref("");

const fetchCustomers = async () => {
  try {
    const res = await api.get("/customer");
    customers.value = res.data.data;
  } catch (err) {
    console.error(err);
  }
};

const filteredCustomers = computed(() => {
  if (!searchCustomer.value) return customers.value;

  return customers.value.filter((c) =>
    c.name.toLowerCase().includes(searchCustomer.value.toLowerCase()),
  );
});

const isInject = computed(() =>
  cart.value.some((item) => item.type === "inject"),
);

const changePage = (page) => {
  currentPage.value = page;
  fetchProducts();
};

const formatCurrency = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val || 0);

/* ========================= KEYBOARD ========================= */
const handleKeydown = (e) => {
  if (e.key === "F2" && !isFullscreen.value) {
    e.preventDefault();
    showCartModal.value = true;
  }

  if (e.key === "Escape") {
    showCartModal.value = false;
    showPaymentDialog.value = false;
  }

  if (e.ctrlKey && e.key === "f") {
    e.preventDefault();
    document.getElementById("search-input")?.focus();
  }

  if (e.key === "F4") {
    e.preventDefault();
    cart.value = [];
  }
};

onMounted(() => {
  checkMobile();

  checkActiveSession();
  fetchProducts();
  fetchFunds();

  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", checkMobile);

  // TAMBAH INI
  window.addEventListener("scroll", handleMobileScroll, {
    passive: true,
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("resize", checkMobile);

  // TAMBAH
  window.removeEventListener("scroll", handleMobileScroll);
});

watch(priceType, () => {
  cart.value = cart.value.map((item) => {
    const product = products.value.find((p) => p.id === item.id);
    if (!product) return item;

    return {
      ...item,
      price: getPrice(product),
    };
  });
});

watch(search, (val) => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    currentPage.value = 1; // reset ke page 1 saat search
    products.value = [];
    mobileFinished.value = false;
    fetchProducts();
  }, 400); // debounce biar gak spam API
});

watch(viewMode, (val) => {
  localStorage.setItem("pos_view_mode", val);
});

onMounted(() => {
  const saved = localStorage.getItem("pos_view_mode");
  if (saved) viewMode.value = saved;
});
</script>

<template>
  <!-- HEADER -->
  <div class="mb-4">
    <div class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-800">Transactions</h1>
        <p class="text-slate-500 text-sm">
          Lakukan pencatatan transaksi di sini
        </p>
      </div>
      <div>
        <button
          @click="openCloseCashier"
          class="flex bg-white hover:bg-gray-100 items-center gap-2 px-3 py-1 text-sm border rounded-md transition-all"
        >
          Tutup Kasir
        </button>
      </div>
    </div>
  </div>

  <!-- TABS -->
  <div class="mb-4 flex justify-between items-center gap-2">
    <div
      class="inline-flex w-full lg:w-auto bg-gray-100 p-1 lg:rounded-full rounded-sm"
    >
      <button
        v-for="menu in menus"
        :key="menu.value"
        @click="changeTab(menu.value)"
        class="flex-1 lg:flex-none flex items-center justify-center lg:gap-2 gap-1 lg:px-4 px-1 py-1.5 text-sm lg:rounded-full rounded-sm transition"
        :class="
          isActive(menu)
            ? 'bg-white shadow text-slate-900'
            : 'text-slate-600 hover:text-slate-900'
        "
      >
        <component v-if="isActive(menu)" :is="menu.icon" class="w-4 h-4" />
        {{ menu.name }}
      </button>
    </div>

    <!-- RIGHT ACTION -->
    <div class="hidden lg:flex gap-2">
      <!-- TOGGLE VIEW -->
      <!-- <button
        @click="viewMode = viewMode === 'table' ? 'card' : 'table'"
        class="flex items-center justify-center p-2 border rounded-lg bg-white hover:bg-gray-50"
        title="Ubah tampilan"
      >
        <span v-if="viewMode === 'table'">📊</span>
        <span v-else>🧩</span>
      </button> -->

      <!-- FULLSCREEN BUTTON -->
      <button
        @click="toggleFullscreen"
        class="flex items-center justify-center p-2 border rounded-lg bg-white hover:bg-gray-50"
      >
        <component :is="isFullscreen ? Shrink : Expand" class="w-4 h-4" />
      </button>
    </div>
  </div>

  <div class="flex-1 min-h-0 flex flex-col">
    <!-- PRODUCT -->
    <template v-if="activeTab === 'product'">
      <div
        v-if="currentViewMode === 'table'"
        class="flex-1 min-h-0 overflow-auto rounded-xl"
      >
        <!-- TABLE LAMA KAMU DI SINI -->
        <div
          :class="isFullscreen ? 'flex h-full gap-4' : 'flex flex-col h-full'"
        >
          <!-- LEFT: PRODUCT -->
          <div
            :class="
              isFullscreen ? 'w-[65%] flex flex-col' : 'w-full flex flex-col'
            "
          >
            <div class="bg-white border rounded-2xl h-full p-5 flex flex-col">
              <!-- HEADER -->
              <div
                class="flex justify-between items-center mb-4 flex-wrap gap-4"
              >
                <div class="flex items-center gap-3">
                  <div class="p-3 bg-slate-50 border rounded-xl">
                    <Package class="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <h3 class="text-xl font-semibold text-gray-900">
                      Transaksi Produk
                    </h3>
                    <p class="text-sm text-slate-500">
                      Klik produk untuk menambahkan ke cart
                    </p>
                  </div>
                </div>

                <!-- RIGHT -->
                <div class="flex items-center gap-2 flex-wrap">
                  <!-- SEARCH -->
                  <div class="relative">
                    <Search
                      class="w-4 h-4 absolute left-3 top-2.5 text-gray-400"
                    />
                    <input
                      id="search-input"
                      v-model="search"
                      type="text"
                      placeholder="Cari produk..."
                      class="pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <!-- SELECT PRICE TYPE -->
                  <Select v-model="priceType">
                    <SelectTrigger class="w-[140px] h-[38px] text-sm">
                      <SelectValue placeholder="Pilih Harga" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="retail">Umum</SelectItem>
                      <SelectItem value="wholesale">Grosir</SelectItem>
                    </SelectContent>
                  </Select>

                  <!-- CART BUTTON -->
                  <button
                    v-if="!isFullscreen"
                    @click="showCartModal = true"
                    class="relative inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-sm text-slate-500"
                  >
                    <ShoppingCart class="w-4 h-4" />
                    F2

                    <!-- BADGE -->
                    <span
                      v-if="totalQty"
                      class="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full"
                    >
                      {{ totalQty }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- TABLE -->
              <div class="flex-1 min-h-0 flex flex-col">
                <div class="flex-1 min-h-0 overflow-auto rounded-xl">
                  <table class="w-full text-sm border border-gray-200">
                    <!-- HEADER -->
                    <thead class="bg-gray-50 text-slate-500">
                      <tr class="divide-x divide-gray-200">
                        <!-- CHECKBOX ALL -->
                        <th class="px-3 py-2 w-10 text-center">
                          <input
                            type="checkbox"
                            :checked="
                              selectedIds.length === products.length &&
                              products.length > 0
                            "
                            @change="
                              selectedIds = $event.target.checked
                                ? products.map((p) => p.id)
                                : []
                            "
                          />
                        </th>

                        <th class="px-3 py-2 text-left">SKU</th>
                        <th class="px-3 py-2 text-left">Produk</th>

                        <!-- NEW STOCK COLUMN -->
                        <th class="px-3 py-2 text-center">Stok</th>

                        <th class="px-3 py-2 text-right">Harga Konsumen</th>
                        <th class="px-3 py-2 text-right">Harga Grosir</th>
                        <th class="px-3 py-2 text-center">Aksi</th>
                      </tr>
                    </thead>

                    <!-- BODY -->
                    <tbody class="divide-y divide-gray-200">
                      <!-- LOADING -->
                      <template v-if="loadingProducts">
                        <tr
                          v-for="i in 8"
                          :key="'skeleton-' + i"
                          class="animate-pulse divide-x divide-gray-200"
                        >
                          <!-- CHECKBOX -->
                          <td class="px-3 py-2 text-center">
                            <div
                              class="h-4 w-4 bg-gray-200 rounded mx-auto"
                            ></div>
                          </td>

                          <!-- SKU -->
                          <td class="px-3 py-2">
                            <div class="h-4 w-20 bg-gray-200 rounded"></div>
                          </td>

                          <!-- PRODUCT -->
                          <td class="px-3 py-2">
                            <div class="h-4 w-40 bg-gray-200 rounded"></div>
                          </td>

                          <!-- STOCK -->
                          <td class="px-3 py-2 text-center">
                            <div
                              class="h-4 w-10 bg-gray-200 rounded mx-auto"
                            ></div>
                          </td>

                          <!-- RETAIL -->
                          <td class="px-3 py-2">
                            <div
                              class="h-4 w-24 bg-gray-200 rounded ml-auto"
                            ></div>
                          </td>

                          <!-- WHOLESALE -->
                          <td class="px-3 py-2">
                            <div
                              class="h-4 w-24 bg-gray-200 rounded ml-auto"
                            ></div>
                          </td>

                          <!-- ACTION -->
                          <td class="px-3 py-2 text-center">
                            <div
                              class="h-6 w-12 bg-gray-200 rounded mx-auto"
                            ></div>
                          </td>
                        </tr>
                      </template>

                      <!-- DATA -->
                      <template v-else>
                        <tr
                          v-for="p in products"
                          :key="p.id"
                          @click="addToCart(p)"
                          class="cursor-pointer transition divide-x divide-gray-200"
                          :class="
                            getCartItem(p.id)
                              ? 'bg-blue-50'
                              : 'hover:bg-gray-50'
                          "
                        >
                          <!-- CHECKBOX -->
                          <td class="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              :value="p.id"
                              v-model="selectedIds"
                              @click.stop
                            />
                          </td>

                          <!-- SKU -->
                          <td class="px-3 py-2 text-xs text-gray-400">
                            {{ p.sku || "-" }}
                          </td>

                          <!-- NAME -->
                          <td class="px-3 py-2">
                            {{ p.name || p.productName }}
                          </td>

                          <!-- STOCK -->
                          <td class="px-3 py-2 text-center">
                            <div
                              class="inline-flex items-center gap-2 px-2 py-0.5 rounded-md border border-gray-200 bg-white"
                            >
                              <span
                                class="w-2 h-2 rounded-full"
                                :class="
                                  (p.stock || 0) == 0
                                    ? 'bg-red-600'
                                    : p.stock <= (p.minimumStock || 5)
                                      ? 'bg-yellow-500'
                                      : 'bg-green-600'
                                "
                              />
                              <span
                                class="text-xs font-medium"
                                :class="
                                  (p.stock || 0) == 0
                                    ? 'text-red-600'
                                    : p.stock <= (p.minimumStock || 5)
                                      ? 'text-yellow-600'
                                      : 'text-gray-700'
                                "
                              >
                                {{ p.stock || 0 }}
                              </span>
                            </div>
                          </td>

                          <!-- RETAIL -->
                          <td class="px-3 py-2 text-right font-medium">
                            {{ formatCurrency(p.retailPrice || p.retail) }}
                          </td>

                          <!-- WHOLESALE -->
                          <td class="px-3 py-2 text-right text-gray-500">
                            {{
                              formatCurrency(p.wholesalePrice || p.wholesale)
                            }}
                          </td>

                          <!-- CART -->
                          <td class="px-3 py-2 text-center">
                            <div
                              v-if="getCartItem(p.id)"
                              class="flex items-center justify-center gap-1"
                            >
                              <!-- MINUS -->
                              <button
                                @click.stop="decreaseQty(p)"
                                class="w-6 h-6 flex items-center justify-center border rounded-md hover:bg-gray-100"
                              >
                                -
                              </button>

                              <!-- QTY -->
                              <span class="w-6 text-center text-xs font-medium">
                                {{ getCartItem(p.id).qty }}
                              </span>

                              <!-- PLUS -->
                              <button
                                @click.stop="increaseQty(p)"
                                class="w-6 h-6 flex items-center justify-center border rounded-md hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>

                            <!-- ADD BUTTON (kalau belum ada di cart) -->
                            <button
                              v-else
                              @click.stop="addToCart(p)"
                              class="px-2 py-1 text-xs bg-blue-900 text-white rounded-md hover:bg-blue-800"
                            >
                              Add
                            </button>
                          </td>
                        </tr>
                        <!-- EMPTY -->
                        <tr v-if="!products.length">
                          <td
                            colspan="7"
                            class="text-center py-6 text-gray-400"
                          >
                            Produk tidak ditemukan
                          </td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
                <div class="flex justify-between items-center mt-3 text-sm">
                  <div>
                    Page {{ currentPage }} / {{ pagination.totalPages }}
                  </div>

                  <div class="flex gap-2">
                    <button
                      :disabled="currentPage === 1"
                      @click="changePage(currentPage - 1)"
                      class="px-3 py-1 border rounded"
                    >
                      Prev
                    </button>

                    <button
                      :disabled="currentPage === pagination.totalPages"
                      @click="changePage(currentPage + 1)"
                      class="px-3 py-1 border rounded"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- RIGHT: CART (ONLY FULLSCREEN) -->
          <div
            v-if="isFullscreen"
            class="w-[35%] bg-white border rounded-2xl p-4 flex flex-col"
          >
            <!-- HEADER -->
            <div class="flex justify-between items-center mb-3">
              <h3 class="font-semibold text-gray-800">Cart</h3>
              <span class="text-sm text-gray-500"> {{ totalQty }} item </span>
            </div>

            <!-- CART LIST -->
            <div class="flex-1 overflow-auto space-y-2">
              <div
                v-for="item in cart"
                :key="item.id"
                class="flex justify-between items-center border rounded-lg p-2"
              >
                <div>
                  <p class="text-sm font-medium">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">
                    {{ formatCurrency(item.price) }}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    @click="decreaseQty(item)"
                    class="w-6 h-6 border rounded"
                  >
                    -
                  </button>

                  <span class="text-sm w-5 text-center">
                    {{ item.qty }}
                  </span>

                  <button
                    @click="increaseQty(item)"
                    class="w-6 h-6 border rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              <div
                v-if="!cart.length"
                class="text-center text-gray-400 text-sm py-6"
              >
                Cart kosong
              </div>
            </div>

            <!-- SUMMARY -->
            <div class="border-t pt-3 mt-3 space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Total</span>
                <span class="font-semibold">
                  {{ formatCurrency(totalAmount) }}
                </span>
              </div>

              <!-- BAYAR -->
              <button
                @click="openPayment"
                class="w-full bg-blue-900 text-white py-2 rounded-lg"
              >
                Bayar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="flex-1 min-h-0 p-2">
        <!-- SEARCH -->
        <div class="sticky top-0 z-10 bg-gray-50 pb-1">
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-3 text-gray-400" />

            <input
              id="search-input-mobile"
              v-model="search"
              type="text"
              placeholder="Cari produk..."
              class="w-full pl-9 pr-3 py-2.5 border rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <!-- FIRST LOADING -->
        <div
          v-if="loadingProducts && currentPage === 1"
          class="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <div
            v-for="i in 8"
            :key="i"
            class="h-24 bg-gray-100 animate-pulse rounded-xl"
          />
        </div>

        <!-- EMPTY -->
        <div
          v-else-if="!products.length"
          class="text-center text-gray-400 py-10"
        >
          Produk tidak ditemukan
        </div>

        <!-- CARD -->
        <div v-else class="flex flex-col gap-3 mt-2">
          <div
            v-for="p in products"
            :key="p.id"
            @click="addToCart(p)"
            class="bg-white border rounded-2xl p-3 flex items-center gap-3 active:scale-[0.98] transition cursor-pointer"
          >
            <!-- AVATAR -->
            <div
              class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border"
            >
              <span class="text-sm font-bold text-slate-700 uppercase">
                {{
                  (p.name || p.productName || "")
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                }}
              </span>
            </div>

            <!-- CONTENT -->
            <div class="flex-1 min-w-0">
              <!-- PRODUCT -->
              <p class="text-sm font-semibold text-slate-800 truncate">
                {{ p.name || p.productName }}
              </p>

              <!-- PRICE -->
              <p class="text-sm font-bold text-blue-900 mt-0.5">
                {{ formatCurrency(getPrice(p)) }}
              </p>

              <!-- STOCK -->
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="w-2 h-2 rounded-full"
                  :class="
                    (p.stock || 0) == 0
                      ? 'bg-red-500'
                      : p.stock <= (p.minimumStock || 5)
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  "
                />

                <span
                  class="text-xs"
                  :class="
                    (p.stock || 0) == 0
                      ? 'text-red-600'
                      : p.stock <= (p.minimumStock || 5)
                        ? 'text-yellow-600'
                        : 'text-slate-500'
                  "
                >
                  Stok {{ p.stock || 0 }}
                </span>
              </div>
            </div>

            <!-- QTY BADGE -->
            <div
              v-if="getCartItem(p.id)"
              class="w-8 h-8 rounded-full bg-blue-900 text-white text-xs font-semibold flex items-center justify-center shrink-0"
            >
              {{ getCartItem(p.id).qty }}
            </div>
          </div>
          <!-- LOAD MORE -->
          <div
            v-if="mobileLoadingMore"
            class="py-4 text-center text-sm text-gray-400"
          >
            Memuat produk...
          </div>

          <!-- END -->
          <div
            v-if="mobileFinished && products.length"
            class="py-4 text-center text-xs text-gray-400"
          >
            Semua produk sudah ditampilkan
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- ================= MANUAL ================= -->
  <div v-if="activeTab === 'manual'" class="flex flex-col h-full">
    <div class="bg-white border rounded-2xl p-6 max-w-xl">
      <!-- TITLE -->
      <div class="mb-6">
        <h3 class="text-xl font-semibold text-gray-900">Transaksi Manual</h3>
        <p class="text-sm text-slate-500">Input transaksi tanpa produk</p>
      </div>

      <div class="space-y-4">
        <!-- HARGA JUAL -->
        <div>
          <label class="text-sm font-medium text-gray-700">
            Harga Jual <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="manual.price"
            type="number"
            placeholder="Masukkan harga jual"
            class="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- HARGA MODAL -->
        <div>
          <label class="text-sm font-medium text-gray-700"> Harga Modal </label>
          <input
            v-model.number="manual.cost"
            type="number"
            placeholder="Opsional"
            class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <!-- STATUS -->
        <div>
          <label class="text-sm font-medium text-gray-700">
            Status Transaksi
          </label>

          <div class="flex gap-2 mt-2">
            <button
              @click="manual.status = 'paid'"
              :class="
                manual.status === 'paid'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              "
              class="px-3 py-1.5 rounded-md text-sm"
            >
              Lunas
            </button>

            <button
              @click="manual.status = 'unpaid'"
              :class="
                manual.status === 'unpaid'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              "
              class="px-3 py-1.5 rounded-md text-sm"
            >
              Belum Lunas
            </button>
          </div>
        </div>

        <!-- CONDITIONAL -->
        <template v-if="manual.status === 'unpaid'">
          <!-- CUSTOMER NAME -->
          <div>
            <label class="text-sm font-medium text-gray-700">
              Nama Konsumen <span class="text-red-500">*</span>
            </label>
            <input
              v-model="manual.customerName"
              type="text"
              placeholder="Nama pelanggan"
              class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <!-- PHONE -->
          <div>
            <label class="text-sm font-medium text-gray-700">
              Nomor HP <span class="text-red-500">*</span>
            </label>
            <input
              v-model="manual.customerPhone"
              type="text"
              placeholder="08xxxx"
              class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </template>

        <!-- FUND SOURCE -->
        <div>
          <label class="text-sm font-medium text-gray-700">
            Sumber Dana Modal
          </label>

          <select
            v-model="manual.fundSource"
            :disabled="manual.status === 'unpaid' || !manual.cost"
            class="mt-1 w-full border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100"
          >
            <option value="">
              {{ loadingFunds ? "Loading..." : "Pilih sumber dana (opsional)" }}
            </option>

            <option v-for="f in FundExcludeCash" :key="f.id" :value="f.id">
              {{ f.nameBank }}
            </option>
          </select>

          <!-- UX NOTE -->
          <p class="text-xs text-gray-400 mt-1">
            Digunakan jika transaksi memiliki modal (misal beli pulsa)
          </p>

          <!-- CONDITIONAL NOTE -->
          <p v-if="manual.status === 'unpaid'" class="text-xs text-gray-400">
            Akan dipilih saat pembayaran dilakukan
          </p>
        </div>

        <!-- NOTES -->
        <div>
          <label class="text-sm font-medium text-gray-700"> Catatan </label>
          <textarea
            v-model="manual.notes"
            rows="3"
            placeholder="Catatan transaksi..."
            class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <!-- ACTION -->
        <div class="pt-4">
          <button
            @click="handleManualSubmit"
            class="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800"
          >
            Simpan Transaksi
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= TRANSFER ================= -->
  <div v-if="activeTab === 'transfer'" class="flex flex-col h-full">
    <div class="bg-white border rounded-2xl p-6 max-w-xl">
      <!-- HEADER -->
      <div class="mb-6">
        <h3 class="text-xl font-semibold text-gray-900">Transaksi Transfer</h3>
        <p class="text-sm text-slate-500">Kirim uang antar bank / saldo</p>
      </div>

      <div class="space-y-4">
        <!-- NOMINAL -->
        <div>
          <label class="text-sm font-medium">Nominal Transfer *</label>
          <input
            v-model.number="transfer.amount"
            type="number"
            class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Masukkan nominal"
          />
        </div>

        <!-- ADMIN BANK -->
        <div>
          <label class="text-sm font-medium">Admin Bank</label>
          <input
            v-model.number="transfer.adminBank"
            type="number"
            class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Biaya dari bank"
          />
        </div>

        <!-- ADMIN CUSTOMER -->
        <div>
          <label class="text-sm font-medium"> Admin Konsumen (Profit) </label>
          <input
            v-model.number="transfer.adminCustomer"
            type="number"
            class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Keuntungan"
          />
        </div>

        <!-- FUND SOURCE -->
        <div>
          <label class="text-sm font-medium"> Sumber Dana (Debit) </label>

          <select
            v-model="transfer.fundSource"
            :disabled="transfer.status === 'unpaid'"
            class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">
              {{ loadingFunds ? "Loading..." : "Pilih sumber dana" }}
            </option>

            <option v-for="f in FundExcludeCash" :key="f.id" :value="f.id">
              {{ f.nameBank }}
            </option>
          </select>
        </div>

        <!-- STATUS -->
        <div>
          <label class="text-sm font-medium">Status</label>
          <div class="flex gap-2 mt-2">
            <button
              @click="transfer.status = 'paid'"
              :class="
                transfer.status === 'paid'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100'
              "
              class="px-3 py-1.5 rounded-md text-sm"
            >
              Lunas
            </button>

            <button
              @click="transfer.status = 'unpaid'"
              :class="
                transfer.status === 'unpaid'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100'
              "
              class="px-3 py-1.5 rounded-md text-sm"
            >
              Belum Lunas
            </button>
          </div>
        </div>

        <!-- CONDITIONAL CUSTOMER -->
        <template v-if="transfer.status === 'unpaid'">
          <div>
            <label class="text-sm">Nama Konsumen *</label>
            <input
              v-model="transfer.customerName"
              class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label class="text-sm">No HP *</label>
            <input
              v-model="transfer.customerPhone"
              class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </template>

        <!-- NOTES -->
        <div>
          <label class="text-sm">Catatan</label>
          <textarea
            v-model="transfer.notes"
            rows="3"
            class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <!-- SUMMARY -->
        <div class="bg-gray-50 p-3 rounded-lg text-sm">
          <div class="flex justify-between">
            <span>Total diterima</span>
            <span>{{ formatCurrency(totalReceive) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Total saldo terpotong</span>
            <span>{{ formatCurrency(totalDebit) }}</span>
          </div>
        </div>

        <!-- ACTION -->
        <button
          @click="handleTransferSubmit"
          class="w-full bg-blue-900 text-white py-2 rounded-lg"
        >
          Simpan Transaksi
        </button>
      </div>
    </div>
  </div>

  <!-- ================= WITHDRAW ================= -->
  <div v-if="activeTab === 'withdraw'" class="flex flex-col h-full">
    <div class="bg-white border rounded-2xl p-6 max-w-xl">
      <!-- HEADER -->
      <div class="mb-6">
        <h3 class="text-xl font-semibold text-gray-900">Tarik Tunai</h3>
        <p class="text-sm text-slate-500">Tarik saldo ke rekening / e-wallet</p>
      </div>

      <div class="space-y-4">
        <!-- NOMINAL -->
        <div>
          <label class="text-sm font-medium"> Nominal Penarikan * </label>
          <input
            v-model.number="withdraw.amount"
            type="number"
            class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Masukkan nominal"
          />
        </div>

        <!-- ADMIN -->
        <div>
          <label class="text-sm font-medium"> Admin (Keuntungan) </label>
          <input
            v-model.number="withdraw.admin"
            type="number"
            class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Opsional"
          />
        </div>

        <!-- SWITCH -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-700">Admin di dalam</p>
            <p class="text-xs text-gray-400">
              Default: admin dipotong dari nominal
            </p>
          </div>

          <!-- gunakan komponen switch kamu -->
          <input
            type="checkbox"
            v-model="withdraw.isAdminIncluded"
            class="toggle"
          />
        </div>

        <!-- FUND TARGET -->
        <div>
          <label class="text-sm font-medium"> Dana Masuk ke </label>

          <select
            v-model="withdraw.fundTarget"
            class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">
              {{ loadingFunds ? "Loading..." : "Pilih akun tujuan" }}
            </option>

            <option v-for="f in FundExcludeCash" :key="f.id" :value="f.id">
              {{ f.nameBank }}
            </option>
          </select>
        </div>

        <!-- NOTES -->
        <div>
          <label class="text-sm font-medium"> Catatan </label>
          <textarea
            v-model="withdraw.notes"
            rows="3"
            class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <!-- SUMMARY -->
        <div class="bg-gray-50 p-3 rounded-lg text-sm">
          <div class="flex justify-between">
            <span>Kas keluar</span>
            <span>{{ formatCurrency(withdrawCashOut) }}</span>
          </div>

          <div class="flex justify-between">
            <span>Saldo masuk</span>
            <span>{{ formatCurrency(withdrawFundIn) }}</span>
          </div>

          <div class="flex justify-between font-medium">
            <span>Profit</span>
            <span>{{ formatCurrency(withdraw.admin) }}</span>
          </div>
        </div>

        <!-- ACTION -->
        <button
          @click="handleWithdrawSubmit"
          class="w-full bg-blue-900 text-white py-2 rounded-lg"
        >
          Simpan Transaksi
        </button>
      </div>
    </div>
  </div>

  <!-- PAYMENT DIALOG FULL -->
  <div
    v-if="showPaymentDialog"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
  >
    <div
      class="bg-white w-[720px] max-h-[90vh] rounded-xl flex flex-col shadow-xl"
    >
      <!-- HEADER -->
      <div class="flex justify-between items-center px-6 py-4 border-b">
        <h3 class="text-lg font-semibold">Pembayaran</h3>
        <button @click="showPaymentDialog = false">✕</button>
      </div>

      <!-- CONTENT -->
      <div class="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        <!-- TOTAL -->
        <div class="text-center">
          <p class="text-sm text-gray-500">Total Bayar</p>
          <p class="text-3xl font-bold text-blue-900">
            {{ formatCurrency(finalTotal) }}
          </p>
        </div>

        <!-- STATUS -->
        <div class="flex gap-2">
          <button
            @click="payment.status = 'paid'"
            :class="
              payment.status === 'paid'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white'
            "
            class="flex-1 border rounded-lg py-2 font-medium"
          >
            Lunas
          </button>

          <button
            @click="payment.status = 'unpaid'"
            :class="
              payment.status === 'unpaid'
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white'
            "
            class="flex-1 border rounded-lg py-2 font-medium"
          >
            Piutang
          </button>
        </div>

        <!-- ================= PAID ================= -->
        <div v-if="payment.status === 'paid'" class="space-y-4">
          <!-- METODE -->
          <div>
            <label class="text-sm font-medium text-gray-700">
              Metode Pembayaran
            </label>
            <select
              v-model="payment.method"
              class="mt-1 w-full border rounded-lg px-3 py-2 capitalize"
            >
              <option value="">Pilih metode</option>
              <option
                v-for="m in paymentMethods"
                :key="m"
                :value="m"
                class="capitalize"
              >
                {{ m }}
              </option>
            </select>
          </div>

          <!-- SUMBER DANA -->
          <div v-if="isInject">
            <label class="text-sm font-medium text-gray-700">
              Sumber Dana
            </label>
            <select
              v-model="payment.fundSource"
              class="mt-1 w-full border rounded-lg px-3 py-2"
            >
              <option value="">Pilih sumber dana</option>
              <option v-for="f in injectFunds" :key="f.id" :value="f.id">
                {{ f.nameBank || f.nameAccount || f.type }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700"> Diskon </label>

            <div class="flex gap-2">
              <!-- TYPE -->
              <select
                v-model="discount.type"
                class="w-[120px] border rounded-lg px-2 py-2"
              >
                <option value="nominal">Rp</option>
                <option value="percent">%</option>
              </select>

              <!-- VALUE -->
              <input
                type="number"
                v-model="discount.value"
                placeholder="Masukkan diskon"
                class="flex-1 border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <!-- SUGGEST -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="amt in suggestedAmounts"
              :key="amt"
              @click="payment.amountPaid = amt"
              class="px-3 py-1 border rounded-lg hover:bg-gray-100"
            >
              {{ formatCurrency(amt) }}
            </button>
          </div>

          <!-- INPUT BAYAR -->
          <div>
            <label class="text-sm font-medium text-gray-700">
              Nominal Bayar
            </label>
            <input
              v-model.number="payment.amountPaid"
              type="number"
              class="mt-1 w-full border rounded-lg px-3 py-2 text-lg"
            />
          </div>

          <!-- CHANGE -->
          <div class="flex justify-between text-lg font-semibold">
            <span>Kembalian</span>
            <span :class="change < 0 ? 'text-red-500' : 'text-green-600'">
              {{ formatCurrency(change) }}
            </span>
          </div>
        </div>

        <!-- ================= PIUTANG ================= -->
        <div v-else class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-700">
              Nama Pelanggan
            </label>
            <input
              v-model="payment.customerName"
              class="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <!-- ================= CUSTOMER (COMBOBOX STYLE SIMPLE) ================= -->
        <div>
          <label class="text-sm font-medium text-gray-700"> Pelanggan </label>

          <input
            v-model="searchCustomer"
            placeholder="Cari pelanggan..."
            class="mt-1 w-full border rounded-lg px-3 py-2"
          />

          <div class="max-h-32 overflow-y-auto border rounded-lg mt-2">
            <div
              v-for="c in filteredCustomers"
              :key="c.id"
              @click="payment.customerName = c.name"
              class="p-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {{ c.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="p-4 border-t flex gap-2 bg-white sticky bottom-0">
        <button
          @click="showPaymentDialog = false"
          class="flex-1 border rounded-lg py-3"
        >
          Batal
        </button>

        <button
          @click="handlePay"
          class="flex-1 bg-blue-900 text-white rounded-lg py-3 font-semibold"
        >
          Bayar
        </button>
      </div>
    </div>
  </div>

  <!-- CART MODAL -->
  <CartDrawer
    v-if="!isFullscreen"
    :show="showCartModal"
    :cart="cart"
    :totalAmount="totalAmount"
    :payment="payment.value"
    :isInject="isInject"
    @close="showCartModal = false"
    @clear-cart="cart = []"
    @pay="handleAfterPay"
    @update:payment="
      (val) => {
        payment.value = {
          ...payment.value,
          ...val,
        };
      }
    "
  />

  <CloseCashierDrawer
    :show="showCloseCashier"
    :balances="cashierBalances"
    :loading="loadingClose"
    @close="showCloseCashier = false"
    @submit="submitCloseCashier"
  />
</template>
