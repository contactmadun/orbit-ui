<script setup>
import { ref, watch, computed } from "vue";
import api from "@/axios";
import BaseOverlay from "./BaseOverlay.vue";

import { Package, Store, Warehouse, Boxes } from "lucide-vue-next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const props = defineProps({
  show: Boolean,
  product: Object,
});

const emit = defineEmits(["close", "saved"]);

const outlets = ref([]);
const stocks = ref({});
const loading = ref(false);
const saving = ref(false);
const existingStocks = ref({});
const reference = ref("INITIAL_STOCK");

const totalStock = computed(() => {
  return outlets.value.reduce((total, outlet) => {
    const existing = existingStocks.value[outlet.id] || 0;
    const input = stocks.value[outlet.id];

    return total + (input !== null && input !== undefined ? input : existing);
  }, 0);
});

const fetchStocks = async () => {
  if (!props.product?.id) return;

  const res = await api.get(`/stocks/${props.product.id}`);

  res.data.data.forEach((s) => {
    existingStocks.value[s.outletId] = s.stock;

    // input field kosong
    stocks.value[s.outletId] = null;
  });
};

const resetState = () => {
  stocks.value = {};
  existingStocks.value = {};
  reference.value = "INITIAL_STOCK";
};

const fetchOutlets = async () => {
  loading.value = true;

  try {
    const res = await api.get("/outlet");
    outlets.value = res.data.data || [];

    outlets.value.forEach((o) => {
      if (stocks.value[o.id] === undefined) {
        stocks.value[o.id] = null;
      }
    });
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.show,
  async (v) => {
    if (v) {
      resetState();
      await fetchOutlets(); // tunggu outlet selesai
      await fetchStocks(); // baru isi stock
    }
  },
);

const saveStock = async () => {
  if (!props.product?.id) return;

  saving.value = true;

  try {
    // filter hanya outlet yang benar-benar diisi
    const filteredStocks = {};

    Object.entries(stocks.value).forEach(([outletId, qty]) => {
      if (qty !== null && qty !== undefined && qty !== "") {
        filteredStocks[outletId] = qty;
      }
    });

    // kalau kosong jangan save
    if (Object.keys(filteredStocks).length === 0) {
      emit("close");
      return;
    }

    await api.post("/stocks", {
      productId: props.product.id,
      reference: reference.value,
      stocks: filteredStocks,
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
      class="fixed top-0 right-0 z-[9999] h-full w-[440px] bg-white border-l shadow-xl flex flex-col"
    >
      <!-- HEADER -->
      <div class="px-6 py-5 border-b flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Package class="w-5 h-5" />
          </div>

          <div>
            <h2 class="font-semibold text-slate-900">Manage Product Stock</h2>
            <p class="text-xs text-slate-500">
              Distribute stock across outlets
            </p>
          </div>
        </div>

        <button
          class="text-slate-400 hover:text-slate-600"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- CONTENT -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- PRODUCT CARD -->
        <div class="border rounded-lg p-4 bg-slate-50">
          <p class="text-xs text-slate-500">Product</p>
          <p class="font-semibold text-slate-800">
            {{ product?.productName }}
          </p>

          <div class="flex gap-6 mt-3 text-xs text-slate-500">
            <span class="flex items-center gap-1">
              <Warehouse class="w-3 h-3" />
              {{ outlets.length }} outlets
            </span>

            <span class="flex items-center gap-1">
              <Boxes class="w-3 h-3" />
              Total: {{ totalStock }}
            </span>
          </div>
        </div>

        <!-- STOCK SETTINGS -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-slate-500 uppercase">
            Stock Settings
          </p>

          <Select v-model="reference">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select stock reference" />
            </SelectTrigger>

            <SelectContent class="z-[10000]">
              <SelectItem value="INITIAL_STOCK"> Initial Stock </SelectItem>
              <SelectItem value="MANUAL_ADJUSTMENT">
                Manual Adjustment
              </SelectItem>
              <SelectItem value="STOCK_OPNAME"> Stock Opname </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- OUTLET STOCK -->
        <div class="space-y-3">
          <p class="text-xs font-semibold text-slate-500 uppercase">
            Outlet Distribution
          </p>

          <div v-if="loading" class="text-center text-slate-400">
            Loading outlets...
          </div>

          <div
            v-for="outlet in outlets"
            :key="outlet.id"
            class="border rounded-lg p-4 hover:bg-slate-50 transition"
          >
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center gap-2">
                <Store class="w-4 h-4 text-slate-500" />
                <span class="text-sm font-medium">
                  {{ outlet.name }}
                </span>
              </div>

              <span class="text-xs text-slate-400">
                Current: {{ existingStocks[outlet.id] ?? 0 }}
              </span>
            </div>

            <input
              type="number"
              v-model.number="stocks[outlet.id]"
              placeholder="Enter qty..."
              min="0"
              class="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="border-t px-6 py-4 flex items-center justify-between">
        <div class="text-sm text-slate-500">
          Total Stock:
          <span class="font-semibold text-slate-800">
            {{ totalStock }}
          </span>
        </div>

        <div class="flex gap-2">
          <button
            class="px-4 py-2 text-sm border rounded-md"
            @click="emit('close')"
          >
            Cancel
          </button>

          <button
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md disabled:opacity-50"
            :disabled="saving"
            @click="saveStock"
          >
            {{ saving ? "Saving..." : "Save Stock" }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>
