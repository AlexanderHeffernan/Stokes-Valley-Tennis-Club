<script setup lang="ts">
defineProps<{
  name: 'chevron-down'
  size?: number
}>()
</script>

<template>
  <svg
    aria-hidden="true"
    fill="none"
    :height="size || 16"
    viewBox="0 0 24 24"
    :width="size || 16"
  >
    <path
      v-if="name === 'chevron-down'"
      d="m6 9 6 6 6-6"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
    />
  </svg>
</template>
