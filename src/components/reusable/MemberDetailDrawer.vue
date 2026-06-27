<script setup>
import { ref, watch, computed } from "vue";
import api from "@/axios";
import BaseOverlay from "./BaseOverlay.vue";

import {
  User,
  Phone,
  Store,
  Calendar,
  Gift,
  Wallet,
  ShoppingCart,
  TrendingUp,
  Clock3,
  BadgeInfo,
} from "lucide-vue-next";

const props = defineProps({
  show: Boolean,
  member: Object,
});

const emit = defineEmits(["close"]);

const loading = ref(false);

const detail = ref({
  member: null,
  points: 0,
  debt: 0,
  revenue: 0,
  transactionThisMonth: 0,
  recentTransactions: [],
});

// const fetchDetail = async () => {
//   if (!props.memberId) return;

//   loading.value = true;

//   try {
//     const res = await api.get(`/member/${props.memberId}`);

//     detail.value = {
//       member: res.data.data.member,
//       points: res.data.data.points || 0,
//       debt: res.data.data.debt || 0,
//       revenue: res.data.data.revenue || 0,
//       transactionThisMonth: res.data.data.transactionThisMonth || 0,
//       recentTransactions: res.data.data.recentTransactions || [],
//     };
//   } catch (err) {
//     console.error(err);
//   } finally {
//     loading.value = false;
//   }
// };

// watch(
//   () => props.show,
//   (val) => {
//     if (val) {
//       fetchDetail();
//     }
//   },
// );
const member = computed(() => props.member || {});
</script>
<template>
  <BaseOverlay :show="show" @close="emit('close')" />

  <transition name="slide">
    <div
      v-if="show"
      class="fixed top-0 right-0 z-[9999] h-full w-[420px] bg-white border-l border-slate-200 shadow-xl flex flex-col"
    >
      <!-- HEADER -->
      <div class="px-6 py-4 border-b flex justify-between items-center">
        <div>
          <p class="text-sm text-slate-500">Detail Pelanggan</p>

          <h2 class="font-semibold text-slate-800">
            {{ member?.name || "Informasi Pelanggan" }}
          </h2>
        </div>

        <button
          @click="emit('close')"
          class="p-2 rounded-md hover:bg-slate-100"
        >
          ✕
        </button>
      </div>

      <!-- CONTENT -->
      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <div v-if="loading" class="text-center py-10 text-slate-400">
          Loading...
        </div>

        <template v-else>
          <!-- BASIC INFO -->
          <div class="space-y-4">
            <h3 class="font-semibold text-slate-800">Informasi Dasar</h3>

            <div class="flex justify-between text-sm">
              <span class="flex items-center gap-2 text-slate-500">
                <User class="w-4 h-4" />
                Nama
              </span>

              <span>
                {{ member?.name || "-" }}
              </span>
            </div>

            <div class="flex justify-between text-sm">
              <span class="flex items-center gap-2 text-slate-500">
                <Phone class="w-4 h-4" />
                Telepon
              </span>

              <span>
                {{ member?.phone || "-" }}
              </span>
            </div>

            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Gender</span>

              <span>
                {{
                  member?.gender === "L"
                    ? "Laki-laki"
                    : member?.gender === "P"
                      ? "Perempuan"
                      : "-"
                }}
              </span>
            </div>

            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Rentang Usia</span>

              <span>
                {{ member?.ageRange || "-" }}
              </span>
            </div>

            <div class="flex justify-between text-sm">
              <span class="flex items-center gap-2 text-slate-500">
                <Store class="w-4 h-4" />
                Outlet
              </span>

              <span>
                {{ member?.outlet?.name || "-" }}
              </span>
            </div>

            <div class="flex justify-between text-sm">
              <span class="flex items-center gap-2 text-slate-500">
                <BadgeInfo class="w-4 h-4" />
                Status
              </span>

              <span
                class="px-2 py-1 rounded-md text-xs capitalize"
                :class="
                  member?.status === 'active'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                "
              >
                {{ member?.status || "-" }}
              </span>
            </div>

            <div class="flex justify-between text-sm">
              <span class="flex items-center gap-2 text-slate-500">
                <Calendar class="w-4 h-4" />
                Bergabung
              </span>

              <span>
                {{
                  member?.joined
                    ? new Date(member.joined).toLocaleDateString("id-ID")
                    : "-"
                }}
              </span>
            </div>
          </div>

          <!-- STATISTIC -->
          <div>
            <h3 class="font-semibold text-slate-800 mb-3">
              Statistik Pelanggan
            </h3>

            <div class="grid grid-cols-2 gap-3">
              <div class="border rounded-lg p-3">
                <div class="flex items-center gap-2 text-slate-500 text-xs">
                  <Gift class="w-4 h-4" />
                  Point
                </div>

                <p class="text-xl font-bold mt-2">
                  {{ detail.points }}
                </p>
              </div>

              <div class="border rounded-lg p-3">
                <div class="flex items-center gap-2 text-slate-500 text-xs">
                  <Wallet class="w-4 h-4" />
                  Hutang
                </div>

                <p class="text-lg font-bold mt-2">
                  Rp
                  {{ Number(detail.debt).toLocaleString("id-ID") }}
                </p>
              </div>

              <div class="border rounded-lg p-3">
                <div class="flex items-center gap-2 text-slate-500 text-xs">
                  <ShoppingCart class="w-4 h-4" />
                  Transaksi Bulan Ini
                </div>

                <p class="text-xl font-bold mt-2">
                  {{ detail.transactionThisMonth }}
                </p>
              </div>

              <div class="border rounded-lg p-3">
                <div class="flex items-center gap-2 text-slate-500 text-xs">
                  <TrendingUp class="w-4 h-4" />
                  Revenue
                </div>

                <p class="text-sm font-bold mt-2">
                  Rp
                  {{ Number(detail.revenue).toLocaleString("id-ID") }}
                </p>
              </div>
            </div>
          </div>

          <!-- TRANSACTION -->
          <div>
            <h3 class="font-semibold text-slate-800 mb-3">
              3 Transaksi Terakhir
            </h3>

            <div
              v-if="detail.recentTransactions.length"
              class="border rounded-lg divide-y"
            >
              <div
                v-for="trx in detail.recentTransactions"
                :key="trx.id"
                class="p-3 flex justify-between items-center"
              >
                <div>
                  <p class="font-medium text-sm">
                    {{ trx.productName }}
                  </p>

                  <p class="text-xs text-slate-500">
                    {{ trx.date }}
                  </p>
                </div>

                <span class="font-semibold">
                  Rp
                  {{ Number(trx.total).toLocaleString("id-ID") }}
                </span>
              </div>
            </div>

            <div
              v-else
              class="border-2 border-dashed rounded-xl p-6 text-center bg-slate-50"
            >
              <Clock3 class="w-6 h-6 mx-auto text-slate-400 mb-2" />

              <p class="text-sm text-slate-600">Belum ada transaksi</p>

              <p class="text-xs text-slate-400 mt-1">
                Riwayat transaksi pelanggan akan tampil di sini
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>
