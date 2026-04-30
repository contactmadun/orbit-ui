<script setup>
import { ref, watch, computed } from "vue";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const props = defineProps({
  show: Boolean,
  outlets: Array,
  accounts: Array,
  prefill: Object,
});

const emit = defineEmits(["close", "submit"]);

const form = ref({
  outletId: "",
  accountId: "",
  amount: "",
  note: "",
});

/* filter akun by outlet */
const filteredAccounts = computed(() => {
  if (!form.value.outletId) return [];
  return props.accounts.filter(
    (a) => String(a.outlet) === String(form.value.outletId),
  );
});

/* prefill dari card */
watch(
  () => props.prefill,
  (val) => {
    if (!val) return;

    form.value.outletId = val.outletId || "";
    form.value.accountId = val.accountId || "";
  },
  { immediate: true },
);

/* submit */
const submit = () => {
  emit("submit", { ...form.value });
};

/* close */
const close = () => {
  emit("close");
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[9999] flex">
    <!-- overlay -->
    <div class="absolute inset-0 bg-black/30" @click="close"></div>

    <!-- drawer -->
    <div
      class="ml-auto w-full max-w-md h-full bg-white shadow-xl relative z-50 p-6 flex flex-col"
    >
      <!-- header -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold">Withdraw Balance</h2>
        <p class="text-sm text-slate-500">Tarik saldo dari akun</p>
      </div>

      <!-- form -->
      <div class="space-y-4 flex-1 overflow-y-auto">
        <!-- outlet -->
        <div>
          <label class="text-sm mb-1 block">Outlet</label>
          <Select v-model="form.outletId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih outlet" />
            </SelectTrigger>
            <SelectContent class="z-[10000]">
              <SelectItem
                v-for="o in outlets"
                :key="o.id"
                :value="String(o.id)"
              >
                {{ o.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- account -->
        <div>
          <label class="text-sm mb-1 block">Account</label>
          <Select v-model="form.accountId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih akun" />
            </SelectTrigger>
            <SelectContent class="z-[10000]">
              <SelectItem
                v-for="a in filteredAccounts"
                :key="a.id"
                :value="String(a.id)"
              >
                {{ a.name }} - {{ a.bank }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- amount -->
        <div>
          <label class="text-sm mb-1 block">Amount</label>
          <input
            v-model="form.amount"
            type="number"
            class="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Masukkan nominal penarikan"
          />
        </div>

        <!-- note -->
        <div>
          <label class="text-sm mb-1 block">Note</label>
          <textarea
            v-model="form.note"
            rows="2"
            class="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Catatan"
          />
        </div>
      </div>

      <!-- action -->
      <div class="pt-4 border-t flex gap-2">
        <button @click="close" class="flex-1 border rounded-lg py-2 text-sm">
          Cancel
        </button>

        <button
          @click="submit"
          class="flex-1 bg-blue-900 text-white rounded-lg py-2 text-sm"
        >
          Withdraw
        </button>
      </div>
    </div>
  </div>
</template>
