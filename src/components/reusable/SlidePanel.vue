<script setup>
defineProps({
  show: Boolean,
  title: String,
  width: {
    type: String,
    default: 'w-1/3' // bisa w-[65%]
  }
})

const emit = defineEmits(['close'])
</script>

<template>
  <teleport to="body">
    <transition name="slide">
      <div
        v-if="show"
        class="fixed top-0 right-0 z-50 h-full bg-white shadow-xl"
        :class="width"
      >
        <!-- Header -->
        <div class="flex justify-between items-center px-6 py-4 border-b">
          <h2 class="text-lg font-semibold">{{ title }}</h2>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto h-[calc(100%-64px)]">
          <slot />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
