<script setup>
import { ref } from "vue";
import Sidebar from "./SidebarNavDashboard.vue";
import TopNavbar from "./TopNavbarDashboard.vue";
import { useFullscreen } from "@/composable/useFullscreen";

defineProps({
  title: String,
});

const sidebarOpen = ref(false);
const { isFullscreen } = useFullscreen();
</script>

<template>
  <div
    :class="[
      'min-h-screen flex bg-gray-50 relative overflow-hidden',
      isFullscreen ? 'p-0' : 'p-4',
    ]"
  >
    <!-- DESKTOP SIDEBAR -->
    <div v-if="!isFullscreen" class="hidden lg:block">
      <Sidebar />
    </div>

    <!-- MOBILE OVERLAY -->
    <transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen && !isFullscreen"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        @click="sidebarOpen = false"
      />
    </transition>

    <!-- MOBILE SIDEBAR -->
    <transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="sidebarOpen && !isFullscreen"
        class="fixed inset-y-0 left-0 z-50 w-[286px] lg:w-64 bg-white border-r lg:hidden"
      >
        <Sidebar />
      </div>
    </transition>

    <!-- MAIN CONTENT -->
    <div
      :class="['flex-1 flex flex-col min-w-0', !isFullscreen ? 'lg:ml-64' : '']"
    >
      <!-- TOASTER -->
      <TopNavbar
        v-if="!isFullscreen"
        :title="title"
        @toggleSidebar="sidebarOpen = true"
      />

      <!-- Content with top padding to accommodate fixed navbar -->
      <main
        :class="[
          'space-y-6 overflow-x-hidden min-w-0',
          isFullscreen
            ? 'p-3 lg:p-4' // 🔥 FULL EDGE
            : 'pt-16 p-2 lg:p-6 lg:pt-20',
        ]"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
