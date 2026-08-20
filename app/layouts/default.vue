<script setup lang="ts">
const adminSession = useState<object | null>('admin-session', () => null)
const adminPanelOpen = useState('admin-panel-open', () => true)
const previewWidth = useState<'desktop' | 'mobile'>('admin-preview-width', () => 'desktop')
</script>

<template>
  <div class="site-workspace" :class="{ 'site-workspace--editing': adminSession && adminPanelOpen }">
    <div
      class="site-canvas"
      :class="{ 'site-canvas--mobile': adminSession && adminPanelOpen && previewWidth === 'mobile' }"
    >
      <NuxtRouteAnnouncer />
      <AppHeader />
      <main>
        <slot />
      </main>
    </div>
    <AdminSidebar />
  </div>
</template>

<style scoped>
.site-workspace {
  min-height: 100vh;
  background: #e8eceb;
}

.site-workspace--editing {
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
}

.site-canvas {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  background: var(--color-background);
  container-name: site-preview;
  container-type: inline-size;
  transition: width 300ms ease, box-shadow 300ms ease;
}

.site-workspace--editing .site-canvas {
  width: calc(100% - 380px);
  height: 100dvh;
  min-height: 0;
  margin-left: 0;
  overflow-y: auto;
  box-shadow: 10px 0 35px rgb(0 37 30 / 14%);
}

.site-workspace--editing .site-canvas--mobile {
  width: min(390px, calc(100% - 380px));
  margin-left: 0;
  overflow-x: hidden;
  overflow-y: auto;
  --header-height: 80px;
}

@media (max-width: 850px) {
  .site-workspace--editing .site-canvas,
  .site-workspace--editing .site-canvas--mobile {
    width: 100%;
    margin-left: 0;
  }
}
</style>
