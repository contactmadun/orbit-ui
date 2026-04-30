<script setup>
import BaseOverlay from "@/components/reusable/BaseOverlay.vue";

defineProps({
  show: Boolean,
  data: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "accept"]);
</script>

<template>
  <BaseOverlay :show="show" @close="emit('close')" />

  <teleport to="body">
    <transition name="zoom">
      <div
        v-if="show"
        class="fixed inset-0 z-9999 flex items-start justify-center px-4 py-10 overflow-y-auto"
      >
        <div
          class="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <!-- HEADER -->
          <div class="px-6 py-5 border-b space-y-2">
            <div class="flex justify-between items-start">
              <h2 class="text-xl font-semibold text-gray-900">
                Billing Detail
              </h2>
              <button
                @click="emit('close')"
                class="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <!-- badges -->
            <div class="flex flex-wrap gap-2">
              <span
                class="px-2.5 py-1 rounded-full text-xs font-medium"
                :class="
                  data?.status === 'Success'
                    ? 'bg-green-50 text-green-700'
                    : data?.status === 'Processing'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-red-50 text-red-700'
                "
              >
                {{ data?.status }}
              </span>

              <span
                class="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
              >
                Plan: {{ data?.planName }}
              </span>
            </div>
          </div>

          <!-- CONTENT -->
          <div class="px-6 py-6 space-y-6 text-sm">
            <!-- Invoice -->
            <div>
              <p class="text-slate-500 mb-1">Invoice</p>
              <p class="font-medium text-slate-900">
                {{ data?.invoice }}
              </p>
            </div>

            <!-- Info blocks -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-slate-50 rounded-xl p-4">
                <p class="text-slate-500 mb-1">Tenant</p>
                <p class="font-medium text-slate-900">
                  {{ data?.tenantName }}
                </p>
              </div>

              <div class="bg-slate-50 rounded-xl p-4">
                <p class="text-slate-500 mb-1">Amount</p>
                <p class="font-medium text-slate-900">
                  {{ data?.amount }}
                </p>
              </div>

              <div class="bg-slate-50 rounded-xl p-4">
                <p class="text-slate-500 mb-1">Purchase Date</p>
                <p class="font-medium text-slate-900">
                  {{ data?.purchase }}
                </p>
              </div>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="px-6 py-4 border-t flex justify-end gap-3">
            <button
              @click="emit('close')"
              class="px-4 py-2 rounded-lg border text-sm hover:bg-slate-50 transition"
            >
              Close
            </button>

            <button
              v-if="data?.status === 'Processing'"
              @click="emit('accept', data)"
              class="px-4 py-2 rounded-lg bg-blue-800 text-white text-sm hover:bg-blue-900 transition"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.25s ease;
}
.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}
</style>
