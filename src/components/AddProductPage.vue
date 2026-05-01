<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "../axios";
import { Package, Copy } from "lucide-vue-next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";

const loading = ref(false);
const categories = ref([]);
const brands = ref([]);
const isInject = ref(false);
const showSuccessDialog = ref(false);
const lastProductName = ref("");
const router = useRouter();
const route = useRoute();

const isEdit = computed(() => !!route.params.id);

const form = ref({
  categoryId: "",
  brandId: "",
  sku: "",
  productName: "",
  description: "",
  costPrice: "",
  retailPrice: "",
  wholesalePrice: "",
  typeProduct: "stok",
  minimumStok: 0,
  status: "active",
});

const marginAmount = computed(() => {
  const cost = Number(form.value.costPrice);
  const retail = Number(form.value.retailPrice);

  if (!cost || !retail) return 0;

  return retail - cost;
});

const marginPercent = computed(() => {
  const cost = Number(form.value.costPrice);
  const retail = Number(form.value.retailPrice);

  if (!cost || !retail) return 0;

  return ((retail - cost) / retail) * 100;
});

async function fetchProduct() {
  try {
    const res = await api.get(`/products/${route.params.id}`);

    const data = res.data.data;

    form.value = {
      categoryId: data.categoryId,
      brandId: data.brandId,
      sku: data.sku,
      productName: data.productName,
      description: data.description,
      costPrice: data.costPrice,
      retailPrice: data.retailPrice,
      wholesalePrice: data.wholesalePrice,
      typeProduct: data.typeProduct,
      minimumStok: data.minimumStok,
      status: data.status,
    };

    isInject.value = data.typeProduct === "inject";
  } catch (err) {
    console.error(err);
  }
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatNumber(value) {
  if (!value) return "";
  return new Intl.NumberFormat("id-ID").format(value);
}

function parseNumber(value) {
  return value.replace(/\D/g, "");
}

function handleRupiahInput(field, event) {
  if (isInject.value && field === "wholesalePrice") {
    return;
  }

  const raw = parseNumber(event.target.value);

  form.value[field] = raw;

  event.target.value = formatNumber(raw);
}
/* ===============================
FETCH CATEGORY & BRAND
=============================== */

async function fetchData() {
  loading.value = true;

  try {
    const [categoryRes, brandRes] = await Promise.all([
      api.get("/category"),
      api.get("/brand"),
    ]);

    categories.value = categoryRes.data.data || [];
    brands.value = brandRes.data.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

/* ===============================
SUBMIT PRODUCT
=============================== */

async function submitProduct(duplicate = false) {
  try {
    loading.value = true;

    let res;

    if (isEdit.value) {
      res = await api.put(`/products/${route.params.id}`, form.value);
    } else {
      res = await api.post("/products", form.value);
    }

    // jika save & duplicate
    if (duplicate && !isEdit.value) {
      lastProductName.value = form.value.productName;

      showSuccessDialog.value = true;

      // reset form untuk produk baru
      form.value = {
        categoryId: form.value.categoryId,
        brandId: form.value.brandId,
        sku: "",
        productName: form.value.productName,
        description: form.value.description,
        costPrice: "",
        retailPrice: "",
        wholesalePrice: "",
        typeProduct: form.value.typeProduct,
        minimumStok: form.value.minimumStok,
        status: "active",
      };

      return;
    }

    // normal save
    router.push("/product/list-product");
  } catch (err) {
    console.log(err);
  } finally {
    loading.value = false;
  }
}

watch(isInject, (val) => {
  form.value.typeProduct = val ? "inject" : "stok";

  if (val) {
    form.value.minimumStok = 0;
    form.value.wholesalePrice = 0;
  }
});

onMounted(() => {
  fetchData();

  if (isEdit.value) {
    fetchProduct();
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- CARD -->
    <div class="bg-white border rounded-xl p-6 space-y-6">
      <!-- PRODUCT INFO -->
      <div>
        <div class="flex gap-4 items-center mb-5">
          <div class="p-3 bg-slate-50 border rounded-2xl border-slate-100">
            <Package class="w-5 h-5 text-blue-900" />
          </div>

          <div>
            <h3 class="text-xl font-semibold text-gray-900">Add Product</h3>
            <p class="text-sm text-slate-500">
              Create a product for your inventory
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- PRODUCT NAME -->
          <div class="col-span-2">
            <label class="text-sm text-gray-600">Nama Produk</label>
            <input
              v-model="form.productName"
              type="text"
              class="w-full mt-1 border rounded-lg px-3 py-2"
              placeholder="Contoh : Telkomsel 50.000"
            />
          </div>

          <!-- SKU -->
          <div>
            <label class="text-sm text-gray-600">SKU</label>
            <input
              v-model="form.sku"
              type="text"
              class="w-full mt-1 border rounded-lg px-3 py-2"
              placeholder="SKU-001"
            />
          </div>

          <!-- TYPE PRODUCT -->
          <div
            class="flex items-center justify-between border rounded-lg px-4 py-3"
          >
            <div>
              <p class="text-sm font-medium text-gray-700">Inject Product</p>
              <p class="text-xs text-gray-500">
                Enable if this is a digital / inject product
              </p>
            </div>

            <Switch v-model="isInject" />
          </div>

          <!-- CATEGORY -->
          <div>
            <label class="text-sm text-gray-600">Category</label>

            <Select v-model="form.categoryId">
              <SelectTrigger class="w-full mt-1">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- BRAND -->
          <div>
            <label class="text-sm text-gray-600">Brand</label>

            <Select v-model="form.brandId">
              <SelectTrigger class="w-full mt-1">
                <SelectValue placeholder="Select Brand" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem
                  v-for="brand in brands"
                  :key="brand.id"
                  :value="brand.id"
                >
                  {{ brand.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- DESCRIPTION -->
          <div class="col-span-2">
            <label class="text-sm text-gray-600">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      <!-- PRICE -->
      <div>
        <h2 class="text-sm font-semibold text-gray-700 mb-4">Pricing</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- COST PRICE -->
          <div>
            <label class="text-sm text-gray-600">Cost Price</label>

            <div class="relative mt-1">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
              >
                Rp
              </span>

              <input
                :value="formatNumber(form.costPrice)"
                @input="handleRupiahInput('costPrice', $event)"
                type="text"
                class="w-full border rounded-lg pl-10 pr-3 py-2"
              />
            </div>
          </div>

          <!-- RETAIL PRICE -->
          <div>
            <label class="text-sm text-gray-600">Retail Price</label>

            <div class="relative mt-1">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
              >
                Rp
              </span>

              <input
                :value="formatNumber(form.retailPrice)"
                @input="handleRupiahInput('retailPrice', $event)"
                type="text"
                class="w-full border rounded-lg pl-10 pr-3 py-2"
              />
            </div>
          </div>

          <!-- WHOLESALE PRICE -->
          <div>
            <label class="text-sm text-gray-600">Wholesale Price</label>

            <div class="relative mt-1">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
              >
                Rp
              </span>

              <input
                :value="formatNumber(form.wholesalePrice)"
                @input="handleRupiahInput('wholesalePrice', $event)"
                type="text"
                :disabled="isInject"
                class="w-full border rounded-lg pl-10 pr-3 py-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
            </div>

            <p v-if="isInject" class="text-xs text-gray-400 mt-1">
              Inject products do not support wholesale pricing
            </p>
          </div>
        </div>
        <!-- MARGIN INFO -->
        <div
          class="mt-4 p-4 rounded-lg bg-gray-50 border flex justify-between text-sm"
        >
          <div>
            <p class="text-gray-500">Margin Amount</p>
            <p class="font-semibold text-green-600">
              {{ formatRupiah(marginAmount) }}
            </p>
          </div>

          <div>
            <p class="text-gray-500">Margin Percent</p>
            <p class="font-semibold text-blue-600">
              {{ marginPercent.toFixed(2) }}%
            </p>
          </div>
        </div>
      </div>

      <!-- INVENTORY -->
      <div>
        <h2 class="text-sm font-semibold text-gray-700 mb-4">Inventory</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-gray-600">Minimum Stock</label>
            <input
              v-model.number="form.minimumStok"
              type="number"
              :disabled="isInject"
              class="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label class="text-sm text-gray-600">Status</label>

            <Select v-model="form.status">
              <SelectTrigger class="w-full mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="active"> Active </SelectItem>

                <SelectItem value="inactive"> Inactive </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <!-- ACTION -->
      <div class="flex justify-end gap-3 pt-4 border-t">
        <!-- CANCEL -->
        <button
          @click="router.push('/product/list-product')"
          class="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
        >
          Cancel
        </button>

        <!-- SAVE & DUPLICATE (ONLY CREATE) -->
        <button
          v-if="!isEdit"
          @click="submitProduct(true)"
          :disabled="loading"
          class="px-4 py-2 border hover:bg-gray-100 rounded-lg text-sm"
        >
          <Copy class="w-4 h-4" />
          Save & Duplicate
        </button>

        <!-- SAVE -->
        <button
          @click="submitProduct(false)"
          :disabled="loading"
          class="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg font-medium text-sm"
        >
          {{ loading ? "Saving..." : isEdit ? "Save Changes" : "Save Product" }}
        </button>
      </div>
    </div>
  </div>
  <AlertDialog v-model:open="showSuccessDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle> Product Added Successfully </AlertDialogTitle>

        <AlertDialogDescription>
          Produk <b>{{ lastProductName }}</b> berhasil ditambahkan. Silakan
          tambahkan produk berikutnya.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogAction @click="showSuccessDialog = false">
          OK
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
