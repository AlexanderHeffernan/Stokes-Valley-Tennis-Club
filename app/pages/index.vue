<script setup lang="ts">
import type { HomeHeroContent } from '#shared/types/home-hero'

const { data: hero } = await useFetch<HomeHeroContent>('/api/content/home-hero')
const previews = useState<Record<string, Record<string, string>>>('page-previews', () => ({}))
const displayedHero = computed(() => (previews.value['home-hero'] as unknown as HomeHeroContent) || hero.value)

useSeoMeta({
  title: 'Home',
  description: 'The official website of Stokes Valley Tennis Club.'
})
</script>

<template>
  <HomeHero v-if="displayedHero" :content="displayedHero" />
</template>
