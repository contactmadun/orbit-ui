<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/axios";
import {
  Search,
  Download,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Package,
  MoreVertical,
} from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import ProductDetailDrawer from "./reusable/ProductDetailDrawer.vue";
import ManageStockDrawer from "./reusable/ManageStockDrawer.vue";

/* =========================
   STATE
========================= */
const router = useRouter();
const search = ref("");
const selectedCategory = ref("");
const showColumnMenu = ref(false);
const currentPage = ref(1);
const perPage = ref(10);
const products = ref([]);
const totalData = ref(0);
const totalPages = ref(1);
const categories = ref([]);
const selectedProduct = ref(null);
const showDrawer = ref(false);
const selectedProductId = ref(null);
const showManageStock = ref(false);
const loadingProducts = ref(false);
const skeletonRows = 10;
const deleteDialog = ref(false);
const deleteText = ref("");
const deleting = ref(false);
const selectedIds = ref([]);

const columns = ref([
  { key: "sku", label: "SKU", visible: true },
  { key: "name", label: "Product Name", visible: true },
  { key: "description", label: "Description", visible: false },
  { key: "category", label: "Category", visible: true },
  { key: "brand", label: "Brand", visible: true },
  { key: "stock", label: "Stock", visible: true },
  { key: "cost_price", label: "Cost", visible: true },
  { key: "retail_price", label: "Retail", visible: true },
  { key: "wholesale_price", label: "Wholesale", visible: true },
  { key: "status", label: "Status", visible: true },
  { key: "created_at", label: "Created", visible: true },
]);

const deleteProduct = (product) => {
  selectedProduct.value = product;
  deleteText.value = "";
  deleteDialog.value = true;
};

const openStock = (product) => {
  selectedProduct.value = product;
  showManageStock.value = true;
};

const closeStock = () => {
  showManageStock.value = false;
  selectedProduct.value = null;
};

const confirmDelete = async () => {
  if (!selectedProduct.value) return;

  deleting.value = true;

  try {
    await api.delete(`/products/${selectedProduct.value.id}`);

    deleteDialog.value = false;

    await fetchProducts(); // reload table
  } catch (err) {
    console.error("Delete error:", err);
  } finally {
    deleting.value = false;
  }
};

const openProductDetail = (id) => {
  selectedProductId.value = id;
  showDrawer.value = true;
};

async function fetchCategories() {
  try {
    const res = await api.get("/category");

    categories.value = res.data.data;
  } catch (err) {
    console.error(err);
  }
}

async function fetchProducts() {
  loadingProducts.value = true;

  try {
    const res = await api.get("/products", {
      params: {
        page: currentPage.value,
        limit: perPage.value,
        search: search.value,
        categoryId: selectedCategory.value,
      },
    });

    const data = res.data;

    products.value = data.data;
    totalData.value = data.pagination.total;
    totalPages.value = data.pagination.totalPages;
  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(() => {
      loadingProducts.value = false;
    }, 300); // biar smooth seperti billing
  }
}
/* =========================
   FORMATTERS
========================= */

const formatCurrency = (value) => {
  if (!value && value !== 0) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const toggleAll = (event) => {
  if (event.target.checked) {
    selectedIds.value = paginatedProducts.value.map((p) => p.id);
  } else {
    selectedIds.value = [];
  }
};

const bulkDelete = async () => {
  if (selectedIds.value.length === 0) return;

  if (!confirm("Hapus produk yang dipilih?")) return;

  try {
    await api.post("/products/bulk-delete", {
      ids: selectedIds.value,
    });

    selectedIds.value = [];

    await fetchProducts();
  } catch (err) {
    console.error(err);
  }
};

const handleStockSaved = async () => {
  await fetchProducts();
};
/* =========================
   FILTERED PRODUCTS
========================= */

const filteredProducts = computed(() => {
  let data = [...products.value];

  if (search.value) {
    data = data.filter(
      (p) =>
        p.productName.toLowerCase().includes(search.value.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.value.toLowerCase()),
    );
  }

  return data;
});

const paginatedProducts = computed(() => filteredProducts.value);

/* =========================
   EXPORT CSV
========================= */

function exportCSV() {
  const headers = columns.value
    .filter((col) => col.visible)
    .map((col) => col.label);

  const rows = filteredProducts.value.map((product) =>
    columns.value.filter((col) => col.visible).map((col) => product[col.key]),
  );

  const csvContent =
    headers.join(",") + "\n" + rows.map((row) => row.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "products.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function isColumnVisible(key) {
  return columns.value.find((c) => c.key === key)?.visible;
}

/* =========================
   TOGGLE COLUMN
========================= */

function toggleColumn(key) {
  const col = columns.value.find((c) => c.key === key);
  if (col) col.visible = !col.visible;
}

watch([search, currentPage, selectedCategory], () => {
  fetchProducts();
});

onMounted(() => {
  fetchProducts();
  fetchCategories();
});
</script>

<template>
  <div class="bg-white rounded-2xl p-6 border border-gray-200">
    <!-- CARD HEADER -->
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <!-- LEFT SIDE -->
      <div class="flex gap-4 items-center">
        <div class="p-3 bg-slate-50 border rounded-2xl border-slate-100">
          <Package class="w-5 h-5 text-blue-900" />
        </div>

        <div>
          <h3 class="text-xl font-semibold text-gray-900">Product Inventory</h3>
          <p class="text-sm text-slate-500">Manage product stock & pricing</p>
        </div>
      </div>

      <!-- RIGHT SIDE ACTION -->
      <div class="flex items-center gap-3 flex-wrap">
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

        <!-- FILTER -->
        <select
          v-model="selectedCategory"
          class="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="">All Category</option>

          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>

        <button
          @click="router.push('/product/create')"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
        >
          + Add Product
        </button>

        <!-- EXPORT -->
        <button
          @click="exportCSV"
          class="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-sm"
        >
          <Download class="w-4 h-4" />
          Export
        </button>

        <button
          v-if="selectedIds.length"
          @click="bulkDelete"
          class="inline-flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 text-sm text-red-700"
        >
          Delete ({{ selectedIds.length }})
        </button>

        <!-- COLUMN TOGGLE -->
        <div class="relative">
          <button
            @click="showColumnMenu = !showColumnMenu"
            class="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-sm"
          >
            <SlidersHorizontal class="w-4 h-4" />
            Columns
          </button>

          <!-- Dropdown -->
          <div
            v-if="showColumnMenu"
            class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-3 space-y-2 z-50"
          >
            <div
              v-for="col in columns"
              :key="col.key"
              class="flex items-center justify-between text-sm"
            >
              <span>{{ col.label }}</span>
              <button @click="toggleColumn(col.key)">
                <Eye v-if="col.visible" class="w-4 h-4 text-gray-500" />
                <EyeOff v-else class="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table
        class="min-w-[1400px] w-full text-sm border border-gray-200 rounded-xl overflow-hidden"
      >
        <!-- HEADER -->
        <thead class="bg-gray-50 text-slate-500 border-b border-gray-200">
          <tr class="divide-x divide-gray-200">
            <th class="px-3 py-2 w-10">
              <input
                type="checkbox"
                @change="toggleAll"
                :checked="selectedIds.length === paginatedProducts.length"
              />
            </th>
            <th
              v-if="isColumnVisible('sku')"
              class="px-3 py-2 text-left font-medium"
            >
              SKU
            </th>

            <th v-if="isColumnVisible('name')" class="px-3 py-2 text-left">
              Product Name
            </th>

            <th
              v-if="isColumnVisible('description')"
              class="px-3 py-2 text-left"
            >
              Description
            </th>

            <th
              v-if="isColumnVisible('category')"
              class="px-3 py-2 text-left font-medium"
            >
              Category
            </th>

            <th
              v-if="isColumnVisible('brand')"
              class="px-3 py-2 text-left font-medium"
            >
              Brand
            </th>

            <th
              v-if="isColumnVisible('stock')"
              class="px-3 py-2 text-center font-medium"
            >
              Total Stock
            </th>

            <th
              v-if="isColumnVisible('cost_price')"
              class="px-3 py-2 text-right font-medium"
            >
              Cost
            </th>

            <th
              v-if="isColumnVisible('retail_price')"
              class="px-3 py-2 text-right font-medium"
            >
              Retail
            </th>

            <th
              v-if="isColumnVisible('wholesale_price')"
              class="px-3 py-2 text-right font-medium"
            >
              Wholesale
            </th>

            <th
              v-if="isColumnVisible('status')"
              class="px-3 py-2 text-left font-medium"
            >
              Status
            </th>

            <th
              v-if="isColumnVisible('created_at')"
              class="px-3 py-2 text-left font-medium"
            >
              Created
            </th>

            <th class="px-3 py-2 text-left font-medium">Action</th>
          </tr>
        </thead>

        <!-- BODY -->
        <tbody class="divide-y divide-gray-200">
          <template v-if="loadingProducts">
            <tr
              v-for="i in 8"
              :key="'skeleton-' + i"
              class="animate-pulse divide-x divide-gray-200"
            >
              <td class="px-3 py-2">
                <div class="h-4 w-4 bg-gray-200 rounded"></div>
              </td>

              <td v-if="isColumnVisible('sku')" class="px-3 py-2">
                <div class="h-4 w-24 bg-gray-200 rounded"></div>
              </td>

              <td v-if="isColumnVisible('name')" class="px-3 py-2">
                <div class="h-4 w-40 bg-gray-200 rounded"></div>
              </td>

              <td v-if="isColumnVisible('description')" class="px-3 py-2">
                <div class="h-4 w-48 bg-gray-200 rounded"></div>
              </td>

              <td v-if="isColumnVisible('category')" class="px-3 py-2">
                <div class="h-4 w-24 bg-gray-200 rounded"></div>
              </td>

              <td v-if="isColumnVisible('brand')" class="px-3 py-2">
                <div class="h-4 w-24 bg-gray-200 rounded"></div>
              </td>

              <td v-if="isColumnVisible('stock')" class="px-3 py-2">
                <div class="h-4 w-12 bg-gray-200 rounded mx-auto"></div>
              </td>

              <td v-if="isColumnVisible('cost_price')" class="px-3 py-2">
                <div class="h-4 w-20 bg-gray-200 rounded ml-auto"></div>
              </td>

              <td v-if="isColumnVisible('retail_price')" class="px-3 py-2">
                <div class="h-4 w-20 bg-gray-200 rounded ml-auto"></div>
              </td>

              <td v-if="isColumnVisible('wholesale_price')" class="px-3 py-2">
                <div class="h-4 w-20 bg-gray-200 rounded ml-auto"></div>
              </td>

              <td v-if="isColumnVisible('status')" class="px-3 py-2">
                <div class="h-4 w-16 bg-gray-200 rounded"></div>
              </td>

              <td v-if="isColumnVisible('created_at')" class="px-3 py-2">
                <div class="h-4 w-24 bg-gray-200 rounded"></div>
              </td>

              <td class="px-3 py-2">
                <div class="h-6 w-6 bg-gray-200 rounded"></div>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr
              v-for="product in paginatedProducts"
              :key="product.id"
              class="hover:bg-gray-50 transition-colors duration-150 divide-x divide-gray-200"
            >
              <!-- Checkbox -->
              <td class="px-3 py-2">
                <input
                  type="checkbox"
                  :value="product.id"
                  v-model="selectedIds"
                />
              </td>

              <td
                v-if="isColumnVisible('sku')"
                class="px-3 py-2 text-xs text-gray-400 whitespace-nowrap"
              >
                {{ product.sku }}
              </td>
              <!-- Product Name -->
              <td v-if="isColumnVisible('name')" class="px-3 py-2">
                {{ product.productName }}
              </td>

              <td v-if="isColumnVisible('description')" class="px-3 py-2">
                {{ product.description }}
              </td>

              <td
                v-if="isColumnVisible('category')"
                class="px-3 py-2 text-gray-500 whitespace-nowrap"
              >
                {{ product.categorie?.name }}
              </td>

              <td
                v-if="isColumnVisible('brand')"
                class="px-3 py-2 text-gray-500 whitespace-nowrap"
              >
                {{ product.brand?.name }}
              </td>

              <!-- STOCK -->
              <td v-if="isColumnVisible('stock')" class="px-3 py-2 text-center">
                <div
                  class="inline-flex items-center gap-2 px-2 py-0.5 rounded-md border border-gray-200 bg-white"
                >
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="
                      (product.stock || 0) == 0
                        ? 'bg-red-600'
                        : product.stock <= product.minimumStok
                          ? 'bg-yellow-500'
                          : 'bg-green-600'
                    "
                  />
                  <span
                    class="text-xs font-medium"
                    :class="
                      (product.stock || 0) == 0
                        ? 'text-red-600'
                        : product.stock <= product.minimumStok
                          ? 'text-yellow-600'
                          : 'text-gray-700'
                    "
                  >
                    {{ product.stock }}
                  </span>
                </div>
              </td>

              <!-- PRICE -->
              <td
                v-if="isColumnVisible('cost_price')"
                class="px-3 py-2 text-right text-gray-600 whitespace-nowrap"
              >
                {{ formatCurrency(product.costPrice) }}
              </td>

              <td
                v-if="isColumnVisible('retail_price')"
                class="px-3 py-2 text-right font-medium text-gray-900 whitespace-nowrap"
              >
                {{ formatCurrency(product.retailPrice) }}
              </td>

              <td
                v-if="isColumnVisible('wholesale_price')"
                class="px-3 py-2 text-right text-gray-600 whitespace-nowrap"
              >
                {{ formatCurrency(product.wholesalePrice) }}
              </td>

              <!-- STATUS -->
              <td v-if="isColumnVisible('status')" class="px-3 py-2">
                <div
                  class="inline-flex items-center gap-2 px-2 py-0.5 rounded-md border border-gray-200 bg-white"
                >
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="
                      product.status === 'active'
                        ? 'bg-green-700'
                        : 'bg-gray-400'
                    "
                  />
                  <span class="text-xs text-gray-500 capitalize">
                    {{ product.status }}
                  </span>
                </div>
              </td>

              <!-- CREATED -->
              <td
                v-if="isColumnVisible('created_at')"
                class="px-3 py-2 text-xs text-gray-400 whitespace-nowrap"
              >
                {{ formatDate(product.createdAt) }}
              </td>

              <!-- ACTION -->
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
                    <DropdownMenuItem @click="openProductDetail(product.id)">
                      View Product
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      @click="
                        router.push({
                          name: 'editProduct',
                          params: { id: product.id },
                        })
                      "
                    >
                      Edit Product
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem @click="openStock(product)">
                      Manage Stock
                    </DropdownMenuItem>

                    <DropdownMenuItem @click="router.push('/product/stock')">
                      Stock History
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      class="text-red-600"
                      @click="deleteProduct(product)"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <!-- PAGINATION -->
      <div class="flex items-center justify-between mt-4 flex-wrap gap-3">
        <!-- INFO -->
        <div class="text-sm text-gray-500">
          Showing
          <span class="font-medium">
            {{ (currentPage - 1) * perPage + 1 }}
          </span>
          -
          <span class="font-medium">
            {{ Math.min(currentPage * perPage, filteredProducts.length) }}
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
    <ManageStockDrawer
      :show="showManageStock"
      :product="selectedProduct"
      @close="closeStock"
      @saved="handleStockSaved"
    />
    <ProductDetailDrawer
      :show="showDrawer"
      :productId="selectedProductId"
      @close="showDrawer = false"
    />
    <AlertDialog v-model:open="deleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle> Hapus Produk </AlertDialogTitle>

          <AlertDialogDescription>
            Pastikan kamu benar benar ingin menghapus produk.
            <br /><br />

            Tulis <b>HAPUS</b> untuk mengkonfirmasi aksi.
            <b>{{ selectedProduct?.productName }}</b>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <input
          v-model="deleteText"
          placeholder="HAPUS"
          class="w-full border rounded-md px-3 py-2 mt-2"
        />

        <AlertDialogFooter>
          <AlertDialogCancel> Batal </AlertDialogCancel>

          <AlertDialogAction
            :disabled="deleteText !== 'HAPUS' || deleting"
            class="bg-red-600 hover:bg-red-700"
            @click="confirmDelete"
          >
            {{ deleting ? "Menghapus..." : "Hapus Produk" }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
