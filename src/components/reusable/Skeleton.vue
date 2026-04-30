<script setup>
defineProps({
  class: String,
});
</script>

<template>
  <div :class="['animate-pulse bg-gray-200 rounded-md', $props.class]" />
</template>
