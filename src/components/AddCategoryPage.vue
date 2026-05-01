<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/axios";
import {
  Plus,
  Search,
  Package,
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

const showModal = ref(false);
const search = ref("");
const loading = ref(false);
const loadingCategorys = ref(false);
const categories = ref([]);

/* delete dialog */

const deleteDialog = ref(false);
const selectedId = ref(null);

/* FORM */

const newCategory = ref({
  name: "",
  description: "",
  status: "active",
});

/* =========================
FORMAT DATE (SAFE)
========================= */

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (isNaN(date)) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

/* =========================
FETCH CATEGORY
========================= */

async function fetchCategories() {
  loadingCategorys.value = true;

  try {
    const res = await api.get("/category");

    categories.value = res.data.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(() => {
      loadingCategorys.value = false;
    }, 3000);
  }
}

/* =========================
ADD CATEGORY
========================= */

async function addCategory() {
  if (!newCategory.value.name) return;

  try {
    await api.post("/category", {
      name: newCategory.value.name,
      description: newCategory.value.description,
      status: newCategory.value.status,
    });

    await fetchCategories();

    newCategory.value = {
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
DELETE CATEGORY
========================= */

function openDeleteDialog(id) {
  selectedId.value = id;
  deleteDialog.value = true;
}

async function confirmDelete() {
  try {
    await api.delete(`/category/${selectedId.value}`);

    await fetchCategories();
  } catch (err) {
    console.error(err);
  } finally {
    deleteDialog.value = false;
    selectedId.value = null;
  }
}

/* =========================
FILTER
========================= */

const filteredCategories = computed(() => {
  if (!search.value) return categories.value;

  return categories.value.filter((c) =>
    c.name.toLowerCase().includes(search.value.toLowerCase()),
  );
});

/* =========================
SUMMARY
========================= */

const totalCategory = computed(() => categories.value.length);

const activeCategory = computed(
  () => categories.value.filter((c) => c.status === "active").length,
);

const inactiveCategory = computed(
  () => categories.value.filter((c) => c.status === "inactive").length,
);

/* =========================
MOUNT
========================= */

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div class="space-y-6">
    <!-- SUMMARY CARDS -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- TOTAL CATEGORY -->
      <div
        class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
      >
        <div class="flex gap-2 items-center mb-2">
          <div
            class="w-8 h-8 bg-slate-100 text-blue-900 rounded-lg flex items-center justify-center"
          >
            <Package class="w-4 h-4" />
          </div>
          <p class="text-base font-semibold text-slate-800">Total Category</p>
        </div>
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <h2 class="text-2xl text-slate-800 font-bold">
              {{ totalCategory }}
            </h2>
          </div>
          <svg viewBox="0 0 100 30" class="w-20 h-8">
            <polyline
              fill="none"
              stroke="#2563eb"
              stroke-width="2"
              points="0,20 15,18 30,15 45,17 60,10 75,12 90,6 100,8"
            />
          </svg>
        </div>
        <p class="text-sm text-slate-600">
          Total kategori yang tersedia di sistem.
        </p>
      </div>

      <!-- ACTIVE CATEGORY -->
      <div
        class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
      >
        <div class="flex gap-2 items-center mb-2">
          <div
            class="w-8 h-8 bg-slate-100 text-green-700 rounded-lg flex items-center justify-center"
          >
            <CircleCheck class="w-4 h-4" />
          </div>
          <p class="text-base font-semibold text-slate-800">Active Category</p>
        </div>
        <h2 class="text-2xl text-green-600 font-bold mb-2">
          {{ activeCategory }}
        </h2>
        <p class="text-sm text-slate-600">
          Kategori yang sedang aktif digunakan.
        </p>
      </div>

      <!-- INACTIVE CATEGORY -->
      <div
        class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition"
      >
        <div class="flex gap-2 items-center mb-2">
          <div
            class="w-8 h-8 bg-slate-100 text-red-700 rounded-lg flex items-center justify-center"
          >
            <CircleX class="w-4 h-4" />
          </div>
          <p class="text-base font-semibold text-slate-800">
            Inactive Category
          </p>
        </div>
        <h2 class="text-2xl text-red-600 font-bold mb-2">
          {{ inactiveCategory }}
        </h2>
        <p class="text-sm text-slate-600">
          Kategori yang saat ini tidak aktif.
        </p>
      </div>
    </div>

    <!-- SEARCH -->
    <div class="bg-white rounded-2xl p-6 border border-gray-200">
      <!-- HEADER -->
      <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
        <!-- TITLE -->
        <div class="flex gap-4 items-center">
          <div class="p-3 bg-slate-50 border rounded-2xl border-slate-100">
            <Package class="w-5 h-5 text-blue-900" />
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Category List</h3>
            <p class="text-sm text-slate-500">Manage product categories</p>
          </div>
        </div>
        <!-- ACTION -->
        <div class="flex items-center gap-3">
          <!-- SEARCH -->
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              v-model="search"
              type="text"
              placeholder="Search category..."
              class="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <!-- ADD -->
          <button
            @click="showModal = true"
            class="inline-flex items-center gap-2 px-4 py-2 bg-white text-sm border border-gray-200 hover:bg-gray-50 rounded-lg"
          >
            <Plus class="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>
      <!-- TABLE -->
      <div class="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table class="min-w-[900px] w-full text-sm border border-gray-200">
          <thead class="bg-gray-50 text-slate-500 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left font-medium">Category</th>
              <th class="px-4 py-3 text-left font-medium">Description</th>
              <th class="px-4 py-3 text-left font-medium">Status</th>
              <th class="px-4 py-3 text-left font-medium">Created</th>
              <th class="px-4 py-3 text-center font-medium">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <template v-if="loadingCategorys">
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
                v-for="category in filteredCategories"
                :key="category.id"
                class="hover:bg-gray-50 transition"
              >
                <td class="px-4 py-3 font-medium text-gray-800">
                  {{ category.name }}
                </td>
                <td class="px-4 py-3 text-gray-500">
                  {{ category.description }}
                </td>
                <td class="px-4 py-3">
                  <div
                    class="inline-flex items-center gap-2 px-2 py-0.5 rounded-md border border-gray-200 bg-white"
                  >
                    <span
                      class="w-2 h-2 rounded-full"
                      :class="
                        category.status === 'active'
                          ? 'bg-green-600'
                          : 'bg-gray-400'
                      "
                    />
                    <span class="text-xs text-gray-600 capitalize">
                      {{ category.status }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-400 text-xs">
                  {{ formatDate(category.createdAt) }}
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="openDeleteDialog(category.id)"
                    class="p-2 rounded-md border border-gray-200 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
          <tbody v-if="loading">
            <tr>
              <td colspan="5" class="text-center py-6 text-gray-400">
                Loading categories...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white w-full max-w-md rounded-xl p-6 space-y-4">
        <h2 class="text-lg font-semibold">Add Category</h2>

        <input
          v-model="newCategory.name"
          type="text"
          placeholder="Category Name"
          class="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <textarea
          v-model="newCategory.description"
          placeholder="Description"
          class="w-full border rounded-lg px-3 py-2 text-sm"
        ></textarea>

        <select
          v-model="newCategory.status"
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
            @click="addCategory"
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
          <AlertDialogTitle> Delete Category </AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete this category? This action cannot be
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
