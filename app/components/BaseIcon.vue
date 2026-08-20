<script setup lang="ts">
defineProps<{
  name: 'chevron-down' | 'panel-close' | 'panel-open'
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
    <path
      v-else-if="name === 'panel-close'"
      d="M4 5h16v14H4V5Zm10 0v14m-3-10-3 3 3 3"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.8"
    />
    <path
      v-else-if="name === 'panel-open'"
      d="M4 5h16v14H4V5Zm6 0v14m3-10 3 3-3 3"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.8"
    />
  </svg>
</template>
