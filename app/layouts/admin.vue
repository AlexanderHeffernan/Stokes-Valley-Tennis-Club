<template>
  <main class="admin-layout">
    <NuxtRouteAnnouncer />
    <slot />
  </main>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #f3f5f4;
}
</style>
