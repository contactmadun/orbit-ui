<script setup>
import { ref, watch, computed } from "vue";
import api from "@/axios";

import BaseOverlay from "./BaseOverlay.vue";

import { Package } from "lucide-vue-next";

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
const products = ref([]);
const outlets = ref([]);
const loading = ref(false);
const saving = ref(false);
const openProduct = ref(false);

/* searchable product */
const productSearch = ref("");
const productOpen = ref(false);

const selectedProduct = computed(() => {
  return products.value.find((p) => p.id === form.value.productId);
});

/* form */
const defaultForm = {
  productId: "",
  outletId: "",
  qty: "",
  type: "in",
  notes: "",

  costPriceOverride: "",
  retailPriceOverride: "",
  wholesalePriceOverride: "",
};

const form = ref({ ...defaultForm });

const resetForm = () => {
  form.value = { ...defaultForm };
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

watch(productSearch, async (val) => {
  await fetchProducts(val);
});

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

/* save */
const saveStock = async () => {
  saving.value = true;

  try {
    await api.post("/stocks/add-stock", form.value);

    emit("saved");
    emit("close");

    resetForm();
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
      class="fixed right-0 top-0 z-[9999] h-full w-[520px] bg-white border-l shadow-xl flex flex-col"
    >
      <!-- HEADER -->
      <div class="p-6 border-b flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"
          >
            <Package class="w-5 h-5" />
          </div>

          <div>
            <h2 class="text-lg font-semibold">Stock Adjustment</h2>
            <p class="text-sm text-gray-500">Adjust inventory manually</p>
          </div>
        </div>

        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <!-- BODY -->
      <div class="flex-1 overflow-y-auto p-6 space-y-8">
        <!-- PRODUCT -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-500 uppercase">Product</p>

          <Popover v-model:open="openProduct">
            <PopoverTrigger as-child>
              <button
                class="w-[260px] flex items-center justify-between border rounded-lg px-3 py-2 text-sm bg-white"
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

            <PopoverContent class="w-[260px] z-[10000] p-0">
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

        <!-- OUTLET -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-500 uppercase">Outlet</p>

          <Select v-model="form.outletId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select outlet" />
            </SelectTrigger>

            <SelectContent class="z-[10000]">
              <SelectItem v-for="o in outlets" :key="o.id" :value="o.id">
                {{ o.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- ADJUSTMENT SECTION -->
        <div class="space-y-4">
          <p class="text-xs font-semibold text-gray-500 uppercase">
            Adjustment
          </p>

          <Select v-model="form.type">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select adjustment type" />
            </SelectTrigger>

            <SelectContent class="z-[10000]">
              <SelectItem value="in">Stock In</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
              <SelectItem value="damage">Damage</SelectItem>
              <SelectItem value="transfer_in">Transfer In</SelectItem>
              <SelectItem value="transfer_out">Transfer Out</SelectItem>
            </SelectContent>
          </Select>

          <input
            v-model.number="form.qty"
            type="number"
            placeholder="Quantity"
            class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- PRICE OVERRIDE -->
        <div class="space-y-4">
          <p class="text-xs font-semibold text-gray-500 uppercase">
            Price Override (Optional)
          </p>

          <input
            v-model="form.costPriceOverride"
            type="number"
            placeholder="Cost Price"
            class="w-full border rounded-lg px-3 py-2 text-sm"
          />

          <input
            v-model="form.retailPriceOverride"
            type="number"
            placeholder="Retail Price"
            class="w-full border rounded-lg px-3 py-2 text-sm"
          />

          <input
            v-model="form.wholesalePriceOverride"
            type="number"
            placeholder="Wholesale Price"
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
          @click="saveStock"
          :disabled="saving"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
        >
          {{ saving ? "Saving..." : "Save Stock" }}
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
