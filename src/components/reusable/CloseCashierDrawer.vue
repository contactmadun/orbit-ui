<script setup>
import { computed, watch, ref } from "vue";

const props = defineProps({
  show: Boolean,
  balances: Array,
  loading: Boolean,
});
const isCalculated = ref(false);
const localBalances = ref([]);
const isProcessing = ref(false);
const closingNote = ref("");
const emit = defineEmits(["close", "submit"]);

const totalDifference = computed(() => {
  return localBalances.value.reduce((sum, b) => {
    const closing = Number(b.closingBalance);
    const system = Number(b.systemBalance);

    // skip kalau invalid
    if (isNaN(closing) || isNaN(system)) return sum;

    const diff = closing - system;

    // 🔥 hanya minus
    if (diff < 0) {
      return sum + diff;
    }

    return sum;
  }, 0);
});

const handleCalculate = () => {
  const hasEmpty = localBalances.value.some((b) => {
    const val = b.closingBalance;
    return (
      val === null ||
      val === undefined ||
      String(val).trim() === "" ||
      isNaN(Number(val))
    );
  });

  if (hasEmpty) {
    alert("Semua saldo harus diisi dulu");
    return;
  }

  // 🔥 DOUBLE CONFIRM
  const confirmCalc = confirm(
    "Pastikan semua saldo sudah benar. Hitung sekarang?",
  );
  if (!confirmCalc) return;

  isProcessing.value = true;

  setTimeout(() => {
    isCalculated.value = true;
    isProcessing.value = false;
  }, 1200);
};

const handleSubmit = () => {
  if (totalDifference.value !== 0 && !closingNote.value) {
    alert("Wajib isi catatan jika terdapat selisih");
    return;
  }

  const confirm1 = confirm("Yakin ingin menutup kasir?");
  if (!confirm1) return;

  if (totalDifference.value !== 0) {
    const confirm2 = confirm("Terdapat selisih saldo. Lanjutkan?");
    if (!confirm2) return;
  }

  const payload = {
    balances: localBalances.value.map((b) => ({
      id: b.id,
      accountId: b.accountId,
      systemBalance: Number(b.systemBalance || 0),
      closingBalance: Number(b.closingBalance || 0),
    })),
    closingNote: closingNote.value || null,
  };

  emit("submit", payload);
};

const formatCurrency = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val || 0);

watch(
  () => props.balances,
  (val) => {
    if (!val || !val.length) return;

    localBalances.value = val.map((b) => ({
      ...b,
      closingBalance: "",
    }));
  },
  { immediate: true },
);

watch(
  () => props.show,
  (val) => {
    if (val) {
      isCalculated.value = false;
      closingNote.value = ""; // 🔥 reset
    }
  },
);
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex justify-end bg-black/30">
    <div class="w-full max-w-md h-full bg-white shadow-xl flex flex-col">
      <!-- HEADER -->
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">Tutup Kasir</h3>
        <p class="text-sm text-gray-500">
          Cocokkan saldo sistem dengan saldo aktual
        </p>
      </div>

      <!-- CONTENT -->
      <div class="flex-1 overflow-auto p-4 space-y-4">
        <div
          v-for="b in localBalances"
          :key="b.id"
          class="border rounded-xl p-3 space-y-2"
        >
          <!-- ACCOUNT -->
          <div class="flex justify-between text-sm">
            <span class="font-medium">{{ b.account?.nameBank || "-" }}</span>
          </div>

          <!-- SYSTEM -->
          <div class="flex justify-between text-xs text-gray-500">
            <span>Saldo Sistem</span>
            <span>
              {{ isCalculated ? formatCurrency(b.systemBalance) : "-" }}
            </span>
          </div>

          <!-- INPUT -->
          <div>
            <label class="text-xs text-gray-500">Saldo Aktual</label>
            <input
              v-model="b.closingBalance"
              type="number"
              class="mt-1 w-full border rounded-md px-2 py-1 text-sm"
            />
          </div>

          <!-- DIFFERENCE -->
          <div
            v-if="isCalculated"
            class="flex justify-between text-xs font-medium"
          >
            <span>Selisih</span>
            <span
              :class="
                Number(b.closingBalance) - Number(b.systemBalance) === 0
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              {{
                formatCurrency(
                  Number(b.closingBalance || 0) - Number(b.systemBalance || 0),
                )
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="p-4 border-t space-y-3">
        <!-- LOADING -->
        <div
          v-if="isProcessing"
          class="flex items-center justify-center gap-2 text-sm"
        >
          <div
            class="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"
          ></div>
          Memproses perhitungan...
        </div>

        <!-- STEP 1: HITUNG -->
        <button
          v-else-if="!isCalculated"
          @click="handleCalculate"
          class="w-full bg-yellow-500 text-white py-2 rounded-lg"
        >
          Hitung Kasir
        </button>

        <!-- STEP 2: HASIL + SUBMIT -->
        <template v-else>
          <!-- NOTE -->
          <div v-if="totalDifference !== 0">
            <label class="text-sm font-medium">
              Catatan Selisih <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="closingNote"
              rows="2"
              class="mt-1 w-full border rounded-lg px-2 py-1 text-sm"
              placeholder="Isi alasan selisih"
            />
          </div>

          <!-- TOTAL -->
          <div class="flex justify-between text-sm font-semibold">
            <span>Total Selisih</span>
            <span
              :class="totalDifference === 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ formatCurrency(totalDifference) }}
            </span>
          </div>

          <!-- SUBMIT -->
          <button
            @click="handleSubmit"
            :disabled="loading"
            class="w-full bg-blue-900 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {{ loading ? "Menyimpan..." : "Tutup Kasir" }}
          </button>
        </template>

        <!-- CANCEL -->
        <button
          @click="$emit('close')"
          :disabled="isCalculated || isProcessing"
          class="w-full border py-2 rounded-lg disabled:opacity-50"
        >
          Batal
        </button>
      </div>
    </div>
  </div>
</template>
