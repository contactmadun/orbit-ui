<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "@/axios";
import {
  Search,
  Package,
  AlertTriangle,
  ArchiveX,
  Plus,
  MoreVertical,
  ArrowLeftRightIcon,
} from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import AddStockDrawer from "@/components/reusable/AddStockDrawer.vue";
import TransferStockDrawer from "@/components/reusable/TransferStockDrawer.vue";
import EditStockPriceDrawer from "@/components/reusable/EditStockPriceDrawer.vue";
import { useRouter } from "vue-router";

/* state */
const loading = ref(true);
const products = ref([]);
const search = ref("");
const showAddStock = ref(false);
const showEditStock = ref(false);
const selectedStock = ref(null);
const showTransferStock = ref(false);
const page = ref(1);
const limit = ref(10);
const dropdown = ref(null);
const toggleDropdown = (id) => {
  dropdown.value = dropdown.value === id ? null : id;
};
const currentPage = ref(1);
const perPage = ref(10);
const totalPages = ref(1);
const totalData = ref(0);
const stats = ref({
  totalProduct: 0,
  lowStock: 0,
  outStock: 0,
});
const router = useRouter();

const openAddStock = () => {
  showAddStock.value = true;
};

const openEditStock = (stock) => {
  selectedStock.value = stock;
  showEditStock.value = true;
};

const fetchStats = async () => {
  try {
    const res = await api.get("/stats/stock");
    stats.value = res.data.data;
  } catch (err) {
    console.error(err);
  }
};

/* fetch products */
const fetchProducts = async () => {
  loading.value = true;

  try {
    const res = await api.get("/stocks", {
      params: {
        page: currentPage.value,
        limit: perPage.value,
      },
    });

    products.value = res.data.data;

    totalPages.value = res.data.pagination.totalPages;
    totalData.value = res.data.pagination.total;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const viewStock = (product) => {
  router.push(`/product/stock-detail/${product.productId}/${product.outletId}`);
};

const editStock = (product) => {
  console.log("edit stock", product);
};

const viewMovement = (product) => {
  console.log("stock movement", product);
};

/* filtering */
const filteredProducts = computed(() => {
  if (!search.value) return products.value;

  return products.value.filter((p) =>
    p.productName.toLowerCase().includes(search.value.toLowerCase()),
  );
});

/* statistics */
const totalProduct = computed(() => products.value.length);

const lowStock = computed(
  () =>
    products.value.filter((p) => p.stock <= p.minStock && p.stock > 0).length,
);
const outStock = computed(
  () => products.value.filter((p) => p.stock === 0).length,
);

watch(currentPage, fetchProducts);

onMounted(() => {
  fetchProducts();
  fetchStats();
});
</script>

<template>
  <div class="space-y-6">
    <!-- PAGE HEADER -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold">Stock Product</h1>

      <div class="flex gap-2">
        <button
          @click="showAddStock = true"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <Plus class="w-4 h-4" />
          Add Stock
        </button>

        <button
          @click="showTransferStock = true"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <ArrowLeftRightIcon class="w-4 h-4" />
          Transfer Stock
        </button>

        <button
          class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
        >
          Stock Opname
        </button>
      </div>
    </div>

    <!-- OVERVIEW CARDS -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- TOTAL PRODUCT -->
      <div
        class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
      >
        <div class="flex gap-2 items-center mb-2">
          <div
            class="w-8 h-8 bg-slate-100 text-blue-700 rounded-lg flex items-center justify-center"
          >
            <Package class="w-4 h-4" />
          </div>
          <p class="text-base font-semibold text-slate-800">Total Product</p>
        </div>

        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <h2 class="text-2xl text-slate-800 font-bold">
              {{ stats.totalProduct }}
            </h2>
            <p class="text-xs text-green-600 font-medium">+8.2%</p>
          </div>

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

      <!-- LOW STOCK -->
      <div
        class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
      >
        <div class="flex gap-2 items-center mb-2">
          <div
            class="w-8 h-8 bg-slate-100 text-amber-700 rounded-lg flex items-center justify-center"
          >
            <AlertTriangle class="w-4 h-4" />
          </div>
          <p class="text-base font-semibold text-slate-800">Low Stock</p>
        </div>

        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <h2 class="text-2xl text-slate-800 font-bold">
              {{ stats.lowStock }}
            </h2>
            <p class="text-xs text-red-600 font-medium">-12.4%</p>
          </div>

          <svg viewBox="0 0 100 30" class="w-20 h-8">
            <polyline
              fill="none"
              stroke="#f59e0b"
              stroke-width="2"
              points="0,10 15,12 30,14 45,17 60,18 75,20 90,22 100,24"
            />
          </svg>
        </div>

        <p class="text-sm text-slate-600">
          Produk dengan stok di bawah batas minimum.
        </p>
      </div>

      <!-- OUT OF STOCK -->
      <div
        class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
      >
        <div class="flex gap-2 items-center mb-2">
          <div
            class="w-8 h-8 bg-slate-100 text-red-700 rounded-lg flex items-center justify-center"
          >
            <ArchiveX class="w-4 h-4" />
          </div>
          <p class="text-base font-semibold text-slate-800">Out of Stock</p>
        </div>

        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <h2 class="text-2xl text-slate-800 font-bold">
              {{ stats.outStock }}
            </h2>
            <p class="text-xs text-red-600 font-medium">+4.1%</p>
          </div>

          <svg viewBox="0 0 100 30" class="w-20 h-8">
            <polyline
              fill="none"
              stroke="#dc2626"
              stroke-width="2"
              points="0,20 15,19 30,18 45,17 60,15 75,14 90,12 100,10"
            />
          </svg>
        </div>

        <p class="text-sm text-slate-600">Produk yang stoknya sudah habis.</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 border border-gray-200">
      <!-- HEADER -->
      <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div class="flex gap-4 items-center">
          <div class="p-3 bg-slate-50 border rounded-2xl border-slate-100">
            <Package class="w-5 h-5 text-blue-900" />
          </div>

          <div>
            <h3 class="text-xl font-semibold text-gray-900">Product Stock</h3>
            <p class="text-sm text-slate-500">
              Manage product stock per outlet
            </p>
          </div>
        </div>

        <!-- SEARCH -->
        <div class="relative">
          <Search class="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />

          <input
            v-model="search"
            type="text"
            placeholder="Search product..."
            class="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- TABLE -->
      <div class="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table class="min-w-[900px] w-full text-sm border border-gray-200">
          <thead class="bg-gray-50 text-slate-500 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left font-medium">SKU</th>
              <th class="px-4 py-3 text-left font-medium">Product</th>
              <th class="px-4 py-3 text-left font-medium">Outlet</th>
              <th class="px-4 py-3 text-left font-medium">Harga Jual</th>
              <th class="px-4 py-3 text-left font-medium">Harga Grosir</th>
              <th class="px-4 py-3 text-left font-medium">Stock</th>
              <th class="px-4 py-3 text-center font-medium">Action</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <!-- SKELETON -->
            <template v-if="loading">
              <tr
                v-for="i in 6"
                :key="'skeleton-' + i"
                class="animate-pulse divide-x divide-gray-200"
              >
                <td class="px-4 py-3">
                  <div class="h-4 w-32 bg-gray-200 rounded"></div>
                </td>

                <td class="px-4 py-3">
                  <div class="h-4 w-24 bg-gray-200 rounded"></div>
                </td>

                <td class="px-4 py-3">
                  <div class="h-4 w-32 bg-gray-200 rounded"></div>
                </td>

                <td class="px-4 py-3">
                  <div class="h-4 w-16 bg-gray-200 rounded"></div>
                </td>

                <td class="px-4 py-3">
                  <div class="h-4 w-20 bg-gray-200 rounded"></div>
                </td>

                <td class="px-4 py-3">
                  <div class="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
                </td>

                <td class="px-4 py-3">
                  <div class="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
                </td>
              </tr>
            </template>

            <!-- DATA -->
            <template v-else>
              <tr
                v-for="product in filteredProducts"
                :key="product.id"
                class="hover:bg-gray-50 transition"
              >
                <!-- SKU -->
                <td class="px-4 py-3 text-gray-500">
                  {{ product.sku }}
                </td>

                <!-- PRODUCT -->
                <td class="px-4 py-3 font-medium text-gray-800">
                  {{ product.productName }}
                </td>

                <!-- OUTLET -->
                <td class="px-4 py-3 text-gray-600">
                  {{ product.outletName }}
                </td>

                <td class="px-4 py-3 text-gray-600">
                  {{ Number(product.retailPrice).toLocaleString() }}
                </td>

                <td class="px-4 py-3 text-gray-600">
                  Rp {{ Number(product.wholesalePrice).toLocaleString() }}
                </td>

                <!-- STOCK -->
                <td class="px-4 py-3 font-semibold">
                  <div
                    class="inline-flex items-center gap-2 px-2 py-0.5 rounded-md border border-gray-200 bg-white"
                  >
                    <span
                      class="w-2 h-2 rounded-full"
                      :class="
                        (product.stock || 0) == 0
                          ? 'bg-red-600'
                          : product.stock <= product.minStock
                            ? 'bg-yellow-500'
                            : 'bg-green-600'
                      "
                    />
                    <span
                      class="text-xs font-medium"
                      :class="
                        (product.stock || 0) == 0
                          ? 'text-red-600'
                          : product.stock <= product.minStock
                            ? 'text-yellow-600'
                            : 'text-gray-700'
                      "
                    >
                      {{ product.stock }}
                    </span>
                  </div>
                </td>

                <td class="px-3 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <button
                        class="inline-flex items-center justify-center px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50"
                      >
                        <MoreVertical class="w-4 h-4 text-gray-600" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" class="w-44">
                      <DropdownMenuItem @click="viewStock(product)">
                        Detail Stock
                      </DropdownMenuItem>

                      <DropdownMenuItem @click="openEditStock(product)">
                        Edit Stock
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem @click="viewMovement(product)">
                        Stock Movement
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>

              <!-- EMPTY -->
              <tr v-if="filteredProducts.length === 0">
                <td colspan="6" class="text-center py-8 text-gray-400">
                  No product found
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
            products
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

            <!-- PAGE NUMBER -->
            <button
              v-for="page in totalPages"
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
    <TransferStockDrawer
      :show="showTransferStock"
      @close="showTransferStock = false"
      @saved="fetchProducts"
    />
    <AddStockDrawer
      :show="showAddStock"
      @close="showAddStock = false"
      @saved="fetchProducts"
    />
    <EditStockPriceDrawer
      :show="showEditStock"
      :stockData="selectedStock"
      @close="showEditStock = false"
      @saved="fetchProducts"
    />
  </div>
</template>
