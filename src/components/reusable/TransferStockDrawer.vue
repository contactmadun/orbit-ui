<script setup>
import { ref, watch, computed } from "vue";
import api from "@/axios";

import BaseOverlay from "./BaseOverlay.vue";

import { ArrowRightLeft } from "lucide-vue-next";

/* shadcn */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Check, ChevronsUpDown } from "lucide-vue-next";

/* props */
const props = defineProps({
  show: Boolean,
});

/* emit */
const emit = defineEmits(["close", "saved"]);

/* state */
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref("");
const products = ref([]);
const outlets = ref([]);
const productSearch = ref("");
const openProduct = ref(false);

/* form */
const form = ref({
  productId: "",
  fromOutletId: "",
  toOutletId: "",
  qty: "",
  notes: "",
});

/* computed */
const selectedProduct = computed(() =>
  products.value.find((p) => p.id === form.value.productId),
);

/* reset */
const resetForm = () => {
  form.value = {
    productId: "",
    fromOutletId: "",
    toOutletId: "",
    qty: "",
    notes: "",
  };
};

/* fetch */
const fetchProducts = async (search = "") => {
  const res = await api.get("/products/search", {
    params: { search },
  });

  products.value = res.data.data || [];
};

const fetchOutlets = async () => {
  const res = await api.get("/outlet");
  outlets.value = res.data.data || [];
};

/* search watch */
watch(productSearch, async (val) => {
  await fetchProducts(val);
});

/* drawer open */
watch(
  () => props.show,
  async (visible) => {
    if (!visible) return;

    loading.value = true;

    try {
      resetForm();
      productSearch.value = "";
      openProduct.value = false;

      await Promise.all([fetchProducts(), fetchOutlets()]);
    } catch (err) {
      console.error(err);
    } finally {
      loading.value = false;
    }
  },
);

/* save transfer */
const transferStock = async () => {
  saving.value = true;
  errorMessage.value = "";

  try {
    await api.post("/stocks/transfer", form.value);

    emit("saved"); // refresh table
    emit("close"); // close drawer

    resetForm();
  } catch (err) {
    errorMessage.value =
      err.response?.data?.message || "Terjadi kesalahan server";
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
      class="fixed right-0 top-0 z-[9999] h-full w-[520px] bg-white border-l shadow-xl flex flex-col"
    >
      <!-- HEADER -->
      <div class="p-6 border-b flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"
          >
            <ArrowRightLeft class="w-5 h-5" />
          </div>

          <div>
            <h2 class="text-lg font-semibold">Transfer Stock</h2>
            <p class="text-sm text-gray-500">Move stock between outlets</p>
          </div>
        </div>

        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      <div class="px-4 mt-5">
        <div
          v-if="errorMessage"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ errorMessage }}
        </div>
      </div>
      <!-- BODY -->
      <div class="flex-1 overflow-y-auto p-6 space-y-8">
        <!-- PRODUCT -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-500 uppercase">Product</p>

          <Popover v-model:open="openProduct">
            <PopoverTrigger as-child>
              <button
                class="w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <span class="truncate">
                  {{
                    selectedProduct
                      ? selectedProduct.productName
                      : "Select product"
                  }}
                </span>

                <ChevronsUpDown class="w-4 h-4 opacity-50" />
              </button>
            </PopoverTrigger>

            <PopoverContent class="w-full p-0 z-[10000]">
              <Command>
                <CommandInput
                  v-model="productSearch"
                  placeholder="Search product..."
                />

                <CommandList>
                  <CommandEmpty>No product found.</CommandEmpty>

                  <CommandGroup>
                    <CommandItem
                      v-for="p in products"
                      :key="p.id"
                      :value="p.productName"
                      @select="
                        form.productId = p.id;
                        openProduct = false;
                      "
                    >
                      <Check
                        class="mr-2 h-4 w-4"
                        :class="
                          form.productId === p.id ? 'opacity-100' : 'opacity-0'
                        "
                      />

                      {{ p.productName }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <!-- FROM OUTLET -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-500 uppercase">
            From Outlet
          </p>

          <Select v-model="form.fromOutletId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select origin outlet" />
            </SelectTrigger>

            <SelectContent class="z-[10000]">
              <SelectItem v-for="o in outlets" :key="o.id" :value="o.id">
                {{ o.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- TO OUTLET -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-500 uppercase">To Outlet</p>

          <Select v-model="form.toOutletId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select destination outlet" />
            </SelectTrigger>

            <SelectContent class="z-[10000]">
              <SelectItem v-for="o in outlets" :key="o.id" :value="o.id">
                {{ o.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- QTY -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-500 uppercase">Quantity</p>

          <input
            v-model.number="form.qty"
            type="number"
            placeholder="Quantity"
            class="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <!-- NOTES -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-500 uppercase">Notes</p>

          <textarea
            v-model="form.notes"
            rows="3"
            placeholder="Optional note..."
            class="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <!-- FOOTER -->
      <div class="p-4 border-t flex justify-end gap-3">
        <button
          @click="emit('close')"
          class="px-4 py-2 border rounded-lg text-sm"
        >
          Cancel
        </button>

        <button
          @click="transferStock"
          :disabled="saving"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
        >
          {{ saving ? "Processing..." : "Transfer Stock" }}
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
