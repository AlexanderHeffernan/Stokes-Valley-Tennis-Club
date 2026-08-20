<template>
  <div>
    <NuxtRouteAnnouncer />
    <AppHeader />
    <main />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Home',
  description: 'The official website of Stokes Valley Tennis Club.'
})
</script>
