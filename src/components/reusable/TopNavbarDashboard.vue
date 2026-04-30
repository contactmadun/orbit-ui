<script setup>
import { Menu } from "lucide-vue-next";
import { useUserStore } from "@/stores";

const userStore = useUserStore();

defineProps({
  title: String,
});

defineEmits(["toggleSidebar"]);
</script>

<template>
  <header
    class="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6 z-30"
  >
    <div class="flex items-center gap-3">
      <!-- HAMBURGER (MOBILE ONLY) -->
      <button
        class="lg:hidden p-2 rounded-md hover:bg-gray-100"
        @click="$emit('toggleSidebar')"
      >
        <Menu class="w-6 h-6" />
      </button>

      <h1 class="text-lg font-semibold">{{ title }}</h1>

      <input
        type="text"
        placeholder="Cari transaksi..."
        class="hidden md:block px-4 py-2 border rounded-lg text-sm"
      />
    </div>

    <div class="flex items-center gap-3">
      <RouterLink
        to="/pos/transaction"
        class="hidden sm:block text-sm border px-4 py-2 rounded-lg"
      >
        POS
      </RouterLink>
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center"
        >
          M
        </div>
        <span class="hidden md:block text-sm font-medium">
          {{ userStore.user?.name }}
        </span>
      </div>
    </div>
  </header>
</template>
