<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/axios";

const router = useRouter();

const loading = ref(false);
const loadingCheck = ref(true);
const funds = ref([]);

/* ================= CEK SESSION ================= */
async function checkSession() {
  try {
    const res = await api.get("/cashier/session");
    console.log(res.data.data);
    if (res.data.data) {
      // 🔥 kalau sudah ada session → langsung ke POS
      router.push("/pos/transaction");
    }
  } catch (err) {
    console.error(err);
  } finally {
    loadingCheck.value = false;
  }
}

/* ================= FETCH FUNDS ================= */
async function fetchFunds() {
  try {
    const res = await api.get("/fund/pos");
    funds.value = res.data.data;
  } catch (err) {
    console.error(err);
  }
}

/* ================= OPEN SESSION ================= */
async function openSession() {
  loading.value = true;
  try {
    await api.post("/cashier/open");

    // 🔥 pakai router, bukan reload
    router.push("/pos/transaction");
  } catch (err) {
    alert(err?.response?.data?.message || "Gagal buka kasir");
  } finally {
    loading.value = false;
  }
}

/* ================= FORMAT ================= */
const formatCurrency = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val || 0);

/* ================= LIFECYCLE ================= */
onMounted(async () => {
  await checkSession(); // 🔥 wajib dulu
  await fetchFunds();
});
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <!-- LOADING CHECK -->
    <div v-if="loadingCheck" class="text-center py-10 text-slate-500">
      Mengecek status kasir...
    </div>

    <div v-else>
      <!-- HEADER -->
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-slate-800">Buka Kasir</h1>
        <p class="text-sm text-slate-500">
          Pastikan saldo awal sesuai sebelum memulai transaksi
        </p>
      </div>

      <!-- CARD -->
      <div class="bg-white border rounded-2xl p-5">
        <!-- EMPTY STATE -->
        <div v-if="!funds.length" class="text-center py-10 text-slate-400">
          Belum ada akun dana
        </div>

        <!-- LIST AKUN -->
        <div v-else class="space-y-3">
          <div
            v-for="f in funds"
            :key="f.id"
            class="flex justify-between items-center border rounded-lg px-4 py-3"
          >
            <div>
              <p class="font-medium text-slate-800">
                {{ f.nameAccount || f.nameBank || f.type }}
              </p>
              <p class="text-xs text-slate-400">
                {{ f.type }}
              </p>
            </div>

            <div class="font-semibold text-slate-900">
              {{ formatCurrency(f.balance) }}
            </div>
          </div>
        </div>

        <!-- INFO -->
        <div class="mt-5 text-sm text-slate-500">
          Saldo di atas akan dijadikan sebagai saldo awal kasir.
        </div>

        <!-- BUTTON -->
        <button
          @click="openSession"
          :disabled="loading || !funds.length"
          class="mt-6 w-full py-3 rounded-xl transition"
          :class="
            loading || !funds.length
              ? 'bg-slate-400 text-white cursor-not -allowed'
              : 'bg-blue-900 text-white hover:bg-blue-800'
          "
        >
          {{ loading ? "Membuka..." : "Buka Kasir" }}
        </button>
      </div>
    </div>
  </div>
</template>
