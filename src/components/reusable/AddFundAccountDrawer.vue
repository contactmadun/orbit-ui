<script setup>
import { ref, watch } from "vue";
import api from "@/axios";
import BaseOverlay from "./BaseOverlay.vue";
import { Switch } from "@/components/ui/switch";
import { Landmark } from "lucide-vue-next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* props */
const props = defineProps({
  show: Boolean,
});

/* emit */
const emit = defineEmits(["close", "saved"]);

/* state */
const outlets = ref([]);
const loading = ref(false);
const saving = ref(false);

/* form */
const defaultForm = {
  outletId: "",
  type: "bank",
  nameBank: "",
  nameAccount: "",
  accountNumber: "",
  balance: 0,
  isDefault: false,
};

const form = ref({ ...defaultForm });

const resetForm = () => {
  form.value = { ...defaultForm };
};

/* fetch outlets */
const fetchOutlets = async () => {
  const res = await api.get("/outlet");
  outlets.value = res.data.data || [];
};

/* open drawer */
watch(
  () => props.show,
  async (visible) => {
    if (!visible) return;

    loading.value = true;

    try {
      resetForm();
      await fetchOutlets();
    } catch (err) {
      console.error(err);
    } finally {
      loading.value = false;
    }
  },
);

/* save */
const saveAccount = async () => {
  saving.value = true;

  try {
    await api.post("/fund", form.value);

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
            <Landmark class="w-5 h-5" />
          </div>

          <div>
            <h2 class="text-lg font-semibold">Add Fund Account</h2>
            <p class="text-sm text-gray-500">Create bank or cash account</p>
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
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
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

        <!-- ACCOUNT TYPE -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-500 uppercase">
            Account Type
          </p>

          <Select v-model="form.type">
            <SelectTrigger class="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent class="z-[10000]">
              <SelectItem value="bank">Bank</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="ewallet">E-Wallet</SelectItem>
              <SelectItem value="server">Server</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- BANK NAME -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-500 uppercase">Bank Name</p>

          <input
            v-model="form.nameBank"
            type="text"
            placeholder="Example: BCA"
            class="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <!-- ACCOUNT NAME -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-500 uppercase">
            Account Name
          </p>

          <input
            v-model="form.nameAccount"
            type="text"
            placeholder="Example: Operasional"
            class="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <!-- ACCOUNT NUMBER -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-500 uppercase">
            Account Number
          </p>

          <input
            v-model="form.accountNumber"
            type="text"
            placeholder="Example: 2801449397"
            class="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <!-- BALANCE -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-500 uppercase">
            Opening Balance
          </p>

          <input
            v-model.number="form.balance"
            type="number"
            placeholder="0"
            class="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <!-- DEFAULT -->
        <div
          class="flex items-center justify-between border rounded-lg p-4 bg-slate-50/50"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">Laci Default</p>
            <p class="text-xs text-slate-500">
              Gunakan sebagai akun default transaksi POS
            </p>
          </div>

          <Switch v-model:checked="form.isDefault" />
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
          @click="saveAccount"
          :disabled="saving"
          class="px-4 py-2 bg-blue-800 text-white rounded-lg text-sm disabled:opacity-50"
        >
          {{ saving ? "Saving..." : "Save Account" }}
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
