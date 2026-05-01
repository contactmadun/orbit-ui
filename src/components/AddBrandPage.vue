<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/axios";

import {
  Tag,
  Plus,
  Search,
  Trash2,
  CircleCheck,
  CircleX,
} from "lucide-vue-next";

/* shadcn dialog */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/* =========================
STATE
========================= */

const brands = ref([]);
const loading = ref(false);
const loadingBrands = ref(false);
const search = ref("");
const showModal = ref(false);

/* delete dialog */

const deleteDialog = ref(false);
const selectedId = ref(null);

const newBrand = ref({
  name: "",
  description: "",
  status: "active",
});

/* =========================
FETCH BRANDS
========================= */

async function fetchBrands() {
  loadingBrands.value = true;
  loading.value = true;

  try {
    const res = await api.get("/brand");
    brands.value = res.data.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
    setTimeout(() => {
      loadingBrands.value = false;
    }, 2000);
  }
}

/* =========================
ADD BRAND
========================= */

async function addBrand() {
  if (!newBrand.value.name) return;

  try {
    await api.post("/brand", {
      name: newBrand.value.name,
      description: newBrand.value.description,
      status: newBrand.value.status,
    });

    await fetchBrands();

    newBrand.value = {
      name: "",
      description: "",
      status: "active",
    };

    showModal.value = false;
  } catch (err) {
    console.error(err);
  }
}

/* =========================
DELETE BRAND
========================= */

function openDeleteDialog(id) {
  selectedId.value = id;
  deleteDialog.value = true;
}

async function confirmDelete() {
  try {
    await api.delete(`/brand/${selectedId.value}`);

    await fetchBrands();
  } catch (err) {
    console.error(err);
  } finally {
    deleteDialog.value = false;
    selectedId.value = null;
  }
}

/* =========================
COMPUTED
========================= */

const filteredBrands = computed(() => {
  if (!search.value) return brands.value;

  return brands.value.filter((b) =>
    b.name.toLowerCase().includes(search.value.toLowerCase()),
  );
});

const totalBrand = computed(() => brands.value.length);

const activeBrand = computed(
  () => brands.value.filter((b) => b.status === "active").length,
);

const inactiveBrand = computed(
  () => brands.value.filter((b) => b.status === "inactive").length,
);

/* =========================
FORMAT DATE
========================= */

function formatDate(date) {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d)) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/* =========================
MOUNT
========================= */

onMounted(() => {
  fetchBrands();
});
</script>

<template>
  <div class="space-y-6">
    <!-- ===================== -->
    <!-- SUMMARY CARDS -->
    <!-- ===================== -->

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- TOTAL BRAND -->
      <div
        class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
      >
        <div class="flex gap-2 items-center mb-2">
          <div
            class="w-8 h-8 bg-slate-100 text-blue-900 rounded-lg flex items-center justify-center"
          >
            <Tag class="w-4 h-4" />
          </div>
          <p class="text-base font-semibold text-slate-800">Total Brand</p>
        </div>

        <div class="flex items-center justify-between mb-2">
          <h2 class="text-2xl text-slate-800 font-bold">
            {{ totalBrand }}
          </h2>

          <svg viewBox="0 0 100 30" class="w-20 h-8">
            <polyline
              fill="none"
              stroke="#2563eb"
              stroke-width="2"
              points="0,20 15,18 30,15 45,17 60,10 75,12 90,6 100,8"
            />
          </svg>
        </div>

        <p class="text-sm text-slate-600">Total brand tersedia dalam sistem.</p>
      </div>

      <!-- ACTIVE BRAND -->
      <div
        class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
      >
        <div class="flex gap-2 items-center mb-2">
          <div
            class="w-8 h-8 bg-slate-100 text-green-700 rounded-lg flex items-center justify-center"
          >
            <CircleCheck class="w-4 h-4" />
          </div>

          <p class="text-base font-semibold text-slate-800">Active Brand</p>
        </div>

        <h2 class="text-2xl text-green-600 font-bold mb-2">
          {{ activeBrand }}
        </h2>

        <p class="text-sm text-slate-600">Brand yang aktif digunakan.</p>
      </div>

      <!-- INACTIVE BRAND -->
      <div
        class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
      >
        <div class="flex gap-2 items-center mb-2">
          <div
            class="w-8 h-8 bg-slate-100 text-red-700 rounded-lg flex items-center justify-center"
          >
            <CircleX class="w-4 h-4" />
          </div>

          <p class="text-base font-semibold text-slate-800">Inactive Brand</p>
        </div>

        <h2 class="text-2xl text-red-600 font-bold mb-2">
          {{ inactiveBrand }}
        </h2>

        <p class="text-sm text-slate-600">Brand yang tidak aktif.</p>
      </div>
    </div>

    <!-- ===================== -->
    <!-- TABLE CARD -->
    <!-- ===================== -->

    <div class="bg-white rounded-2xl p-6 border border-gray-200">
      <!-- HEADER -->

      <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div class="flex gap-4 items-center">
          <div class="p-3 bg-slate-50 border rounded-2xl border-slate-100">
            <Tag class="w-5 h-5 text-blue-900" />
          </div>

          <div>
            <h3 class="text-xl font-semibold text-gray-900">Brand List</h3>

            <p class="text-sm text-slate-500">Manage product brands</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- SEARCH -->
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />

            <input
              v-model="search"
              type="text"
              placeholder="Search brand..."
              class="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <!-- ADD BUTTON -->

          <button
            @click="showModal = true"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
          >
            <Plus class="w-4 h-4" />
            Add Brand
          </button>
        </div>
      </div>

      <!-- ===================== -->
      <!-- TABLE -->
      <!-- ===================== -->

      <div class="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table class="min-w-[900px] w-full text-sm border border-gray-200">
          <thead class="bg-gray-50 text-slate-500 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left font-medium">Brand</th>

              <th class="px-4 py-3 text-left font-medium">Description</th>

              <th class="px-4 py-3 text-left font-medium">Status</th>

              <th class="px-4 py-3 text-left font-medium">Created</th>

              <th class="px-4 py-3 text-center font-medium">Action</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <template v-if="loadingBrands">
              <tr
                v-for="i in 8"
                :key="'skeleton-' + i"
                class="animate-pulse divide-x divide-gray-200"
              >
                <td class="px-3 py-2">
                  <div class="h-4 w-24 bg-gray-200 rounded"></div>
                </td>

                <td class="px-3 py-2">
                  <div class="h-4 w-24 bg-gray-200 rounded"></div>
                </td>

                <td class="px-3 py-2">
                  <div class="h-4 w-40 bg-gray-200 rounded"></div>
                </td>

                <td class="px-3 py-2">
                  <div class="h-4 w-48 bg-gray-200 rounded"></div>
                </td>

                <td class="px-3 py-2">
                  <div class="h-4 w-24 bg-gray-200 rounded"></div>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="brand in filteredBrands"
                :key="brand.id"
                class="hover:bg-gray-50 transition"
              >
                <td class="px-4 py-3 font-medium text-gray-800">
                  {{ brand.name }}
                </td>

                <td class="px-4 py-3 text-gray-500">
                  {{ brand.description }}
                </td>

                <td class="px-4 py-3">
                  <div
                    class="inline-flex items-center gap-2 px-2 py-0.5 rounded-md border border-gray-200 bg-white"
                  >
                    <span
                      class="w-2 h-2 rounded-full"
                      :class="
                        brand.status === 'active'
                          ? 'bg-green-600'
                          : 'bg-gray-400'
                      "
                    />

                    <span class="text-xs text-gray-600 capitalize">
                      {{ brand.status }}
                    </span>
                  </div>
                </td>

                <td class="px-4 py-3 text-gray-400 text-xs">
                  {{ formatDate(brand.createdAt) }}
                </td>

                <td class="px-4 py-3 text-center">
                  <button
                    @click="openDeleteDialog(brand.id)"
                    class="p-2 rounded-md border border-gray-200 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===================== -->
    <!-- MODAL -->
    <!-- ===================== -->

    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white w-full max-w-md rounded-xl p-6 space-y-4">
        <h2 class="text-lg font-semibold">Add Brand</h2>

        <input
          v-model="newBrand.name"
          type="text"
          placeholder="Brand Name"
          class="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <textarea
          v-model="newBrand.description"
          placeholder="Description"
          class="w-full border rounded-lg px-3 py-2 text-sm"
        ></textarea>

        <select
          v-model="newBrand.status"
          class="w-full border rounded-lg px-3 py-2 text-sm"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <div class="flex justify-end gap-2">
          <button
            @click="showModal = false"
            class="px-3 py-2 text-sm rounded-lg border"
          >
            Cancel
          </button>

          <button
            @click="addBrand"
            class="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>

    <AlertDialog v-model:open="deleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle> Delete Brand </AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete this brand? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel> Cancel </AlertDialogCancel>

          <AlertDialogAction
            class="bg-red-600 hover:bg-red-700"
            @click="confirmDelete"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
