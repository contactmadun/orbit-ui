<script setup>
import { ref, watch } from "vue";
import api from "@/axios";

/* ================= PROPS ================= */
const props = defineProps({
  show: Boolean,
  transaction: Object,
});

/* ================= EMIT ================= */
const emit = defineEmits(["close", "updated"]);

/* ================= STATE ================= */
const detail = ref(null);
const loading = ref(false);
const voidLoading = ref(false);

const showVoidConfirm = ref(false);
const voidCode = ref("");

/* ================= FETCH DETAIL ================= */
const fetchDetail = async () => {
  if (!props.transaction?.id) return;

  loading.value = true;
  try {
    const res = await api.get(`/sale/history/${props.transaction.id}`);
    detail.value = res.data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

/* ================= VOID ================= */
const handleVoid = async () => {
  if (!voidCode.value) {
    alert("Masukkan kode void");
    return;
  }

  voidLoading.value = true;
  try {
    await api.post(`/sale/${detail.value.id}/void`, {
      voidCode: voidCode.value,
    });

    alert("Transaksi berhasil di-VOID");

    showVoidConfirm.value = false;
    emit("updated"); // refresh parent
    emit("close");
  } catch (err) {
    console.error(err);
    alert("Gagal void transaksi");
  } finally {
    voidLoading.value = false;
  }
};

/* ================= WATCH ================= */
watch(
  () => props.show,
  (val) => {
    if (val) fetchDetail();
  },
);

/* ================= UTILS ================= */
const formatCurrency = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val || 0);

const formatDate = (val) => new Date(val).toLocaleString("id-ID");
</script>
<template>
  <!-- OVERLAY -->
  <div v-if="show" class="fixed inset-0 bg-black/40 z-50 flex justify-end">
    <!-- DRAWER -->
    <div class="w-full max-w-lg bg-white h-full shadow-xl flex flex-col">
      <!-- HEADER -->
      <div class="p-4 border-b flex justify-between items-center">
        <div>
          <h2 class="text-lg font-semibold">Detail Transaksi</h2>
          <p class="text-xs text-gray-500">
            {{ detail?.trxId || "-" }}
          </p>
        </div>

        <button @click="$emit('close')" class="text-gray-400">✕</button>
      </div>

      <!-- CONTENT -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- LOADING -->
        <div v-if="loading" class="text-center text-gray-400 py-10">
          Loading...
        </div>

        <template v-else-if="detail">
          <!-- INFO -->
          <div class="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
            <div class="flex justify-between">
              <span>Tanggal</span>
              <span>{{ formatDate(detail.createdAt) }}</span>
            </div>

            <div class="flex justify-between">
              <span>Status</span>
              <span
                class="px-2 py-0.5 rounded text-xs"
                :class="{
                  'bg-green-100 text-green-700': detail.status === 'paid',
                  'bg-orange-100 text-orange-700': detail.status === 'unpaid',
                  'bg-red-100 text-red-700': detail.status === 'void',
                }"
              >
                {{ detail.status }}
              </span>
            </div>

            <div class="flex justify-between">
              <span>Tipe</span>
              <span>{{ detail.trxType }}</span>
            </div>

            <div class="flex justify-between">
              <span>Customer</span>
              <span>{{ detail.customerName || "-" }}</span>
            </div>
          </div>

          <!-- ITEMS -->
          <div>
            <h3 class="text-sm font-medium mb-2">Item</h3>

            <div class="border rounded-lg divide-y">
              <div
                v-for="item in detail.items"
                :key="item.id"
                class="p-3 flex justify-between text-sm"
              >
                <div>
                  <div class="font-medium">{{ item.productName }}</div>
                  <div class="text-xs text-gray-400">
                    {{ item.qty }} x {{ formatCurrency(item.sellPrice) }}
                  </div>
                </div>

                <div class="text-right">
                  <div class="font-medium">
                    {{ formatCurrency(item.totalPrice) }}
                  </div>
                  <div class="text-xs text-green-600">
                    +{{ formatCurrency(item.profit) }}
                  </div>
                </div>
              </div>

              <div
                v-if="!detail.items?.length"
                class="p-3 text-center text-gray-400"
              >
                Tidak ada item
              </div>
            </div>
          </div>

          <!-- PAYMENT -->
          <div class="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
            <h3 class="font-medium mb-1">Pembayaran</h3>

            <div class="flex justify-between">
              <span>Total</span>
              <span class="font-medium">
                {{ formatCurrency(detail.totalAmount) }}
              </span>
            </div>

            <div class="flex justify-between">
              <span>Bayar</span>
              <span>{{ formatCurrency(detail.amountPaid) }}</span>
            </div>

            <div class="flex justify-between">
              <span>Kembalian</span>
              <span>{{ formatCurrency(detail.changeAmount) }}</span>
            </div>

            <div class="flex justify-between">
              <span>Profit</span>
              <span class="text-green-600 font-medium">
                {{ formatCurrency(detail.totalProfit) }}
              </span>
            </div>
          </div>

          <!-- ACCOUNT -->
          <div class="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
            <h3 class="font-medium mb-1">Akun</h3>

            <div class="flex justify-between">
              <span>Payment</span>
              <span>{{ detail.paymentAccount?.nameBank || "-" }}</span>
            </div>

            <div class="flex justify-between">
              <span>Source</span>
              <span>{{ detail.sourceAccount?.nameBank || "-" }}</span>
            </div>
          </div>

          <!-- NOTE -->
          <div v-if="detail.note" class="bg-gray-50 p-3 rounded-lg text-sm">
            <h3 class="font-medium mb-1">Catatan</h3>
            <p>{{ detail.note }}</p>
          </div>
        </template>
      </div>

      <!-- FOOTER -->
      <div class="p-4 border-t flex justify-between items-center">
        <!-- VOID BUTTON -->
        <button
          v-if="detail?.status !== 'void'"
          @click="showVoidConfirm = true"
          class="text-red-600 text-sm"
        >
          Void Transaksi
        </button>

        <div class="ml-auto">
          <button
            @click="$emit('close')"
            class="px-4 py-2 border rounded-lg text-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- VOID MODAL -->
    <div
      v-if="showVoidConfirm"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-xl w-full max-w-sm">
        <h3 class="font-semibold mb-2">Konfirmasi Void</h3>
        <p class="text-sm text-gray-500 mb-3">
          Masukkan kode untuk membatalkan transaksi
        </p>

        <input
          v-model="voidCode"
          type="text"
          placeholder="Kode void"
          class="w-full border px-3 py-2 rounded-lg text-sm mb-4"
        />

        <div class="flex justify-end gap-2">
          <button
            @click="showVoidConfirm = false"
            class="px-3 py-2 text-sm border rounded-lg"
          >
            Batal
          </button>

          <button
            @click="handleVoid"
            :disabled="voidLoading"
            class="px-3 py-2 text-sm bg-red-600 text-white rounded-lg"
          >
            {{ voidLoading ? "Proses..." : "Void" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
