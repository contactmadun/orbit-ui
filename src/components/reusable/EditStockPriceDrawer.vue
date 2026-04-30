<script setup>
import { ref, watch, computed } from "vue";
import api from "@/axios";

import BaseOverlay from "./BaseOverlay.vue";

import { Package, X } from "lucide-vue-next";

/* props */
const props = defineProps({
  show: Boolean,
  stockData: Object,
});

const emit = defineEmits(["close", "saved"]);

/* form state */
const form = ref({
  costPrice: "",
  retailPrice: "",
  wholesalePrice: "",
});

/* loading */
const saving = ref(false);

/* isi data saat drawer dibuka */
watch(
  () => props.stockData,
  (data) => {
    if (!data) return;

    form.value.costPrice = data.costPrice || "";
    form.value.retailPrice = data.retailPrice || "";
    form.value.wholesalePrice = data.wholesalePrice || "";
  },
  { immediate: true },
);

/* margin calculation */
const margin = computed(() => {
  const cost = Number(form.value.costPrice);
  const retail = Number(form.value.retailPrice);

  if (!cost || !retail) return 0;

  return (((retail - cost) / cost) * 100).toFixed(1);
});

/* save */
const savePrice = async () => {
  if (!props.stockData) return;

  saving.value = true;

  try {
    await api.put("/stocks/update-price", {
      productId: props.stockData.productId,
      outletId: props.stockData.outletId,
      costPrice: form.value.costPrice,
      retailPrice: form.value.retailPrice,
      wholesalePrice: form.value.wholesalePrice,
    });

    emit("saved");
    emit("close");
  } catch (err) {
    console.error(err);
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <BaseOverlay :show="show" @close="emit('close')" />

  <transition name="slide">
    <div
      v-if="show"
      class="fixed right-0 top-0 h-full w-[420px] bg-white shadow-xl z-[9999] flex flex-col"
    >
      <!-- HEADER -->
      <div class="flex items-start justify-between p-6 border-b">
        <div>
          <h2 class="text-lg font-semibold">Edit Stock Price</h2>
          <p class="text-sm text-gray-500">
            Update price override for this product
          </p>
        </div>

        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- BODY -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- PRODUCT INFORMATION -->
        <div class="bg-gray-50 border rounded-lg p-4 space-y-3">
          <h3 class="text-sm font-semibold text-gray-700">
            Product Information
          </h3>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500">Product</p>
              <p class="font-medium">
                {{ stockData?.productName }}
              </p>
            </div>

            <div>
              <p class="text-gray-500">Outlet</p>
              <p class="font-medium">
                {{ stockData?.outletName }}
              </p>
            </div>

            <div>
              <p class="text-gray-500">Current Stock</p>
              <p class="font-medium">{{ stockData?.stock }} pcs</p>
            </div>

            <div>
              <p class="text-gray-500">SKU</p>
              <p class="font-medium">
                {{ stockData?.sku || "-" }}
              </p>
            </div>
          </div>
        </div>

        <!-- PRICE OVERRIDE -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-gray-700">Price Override</h3>

          <!-- COST -->
          <div>
            <label class="text-sm font-medium text-gray-700">
              Cost Price
            </label>

            <input
              v-model="form.costPrice"
              type="number"
              class="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter cost price"
            />
          </div>

          <!-- RETAIL -->
          <div>
            <label class="text-sm font-medium text-gray-700">
              Retail Price
            </label>

            <input
              v-model="form.retailPrice"
              type="number"
              class="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter retail price"
            />

            <p class="text-xs text-gray-500 mt-1">Margin: {{ margin }}%</p>
          </div>

          <!-- WHOLESALE -->
          <div>
            <label class="text-sm font-medium text-gray-700">
              Wholesale Price
            </label>

            <input
              v-model="form.wholesalePrice"
              type="number"
              class="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter wholesale price"
            />
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="flex justify-end gap-3 p-6 border-t">
        <button
          @click="emit('close')"
          class="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          @click="savePrice"
          :disabled="saving"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {{ saving ? "Saving..." : "Save Changes" }}
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
