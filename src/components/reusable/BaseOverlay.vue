<script setup>
defineProps({
  show: Boolean,
});

const emit = defineEmits(["close"]);
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 bg-black/50 z-[9998]"
        @click.self="emit('close')"
      />
    </transition>
  </teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
