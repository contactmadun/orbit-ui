<script setup>
import { ref, watch } from "vue";
import api from "@/axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const props = defineProps({
  productId: Number,
  open: Boolean,
});

const emit = defineEmits(["update:open"]);

const outlets = ref([]);
const qty = ref(0);
const selectedOutlet = ref(null);

async function fetchStocks() {
  const res = await api.get(`/stocks/product/${props.productId}`);
  outlets.value = res.data.data;
}

watch(
  () => props.open,
  (v) => {
    if (v) fetchStocks();
  },
);

async function addStock(outletId) {
  try {
    await api.post("/stock-movements", {
      productId: props.productId,
      outletId,
      qty: qty.value,
      type: "in",
      reference: "manual_adjustment",
    });

    fetchStocks();
    qty.value = 0;
  } catch (err) {
    console.error(err);
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Manage Stock</DialogTitle>
      </DialogHeader>

      <!-- STOCK TABLE -->
      <div class="space-y-4">
        <div
          v-for="outlet in outlets"
          :key="outlet.id"
          class="flex items-center justify-between border rounded-lg p-3"
        >
          <div>
            <p class="font-medium text-sm">
              {{ outlet.outlet.name }}
            </p>

            <p class="text-xs text-gray-500">Stock: {{ outlet.stock }}</p>
          </div>

          <div class="flex items-center gap-2">
            <Input v-model="qty" type="number" placeholder="Qty" class="w-20" />

            <Button size="sm" @click="addStock(outlet.outletId)"> Add </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
