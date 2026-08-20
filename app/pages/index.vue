<script setup lang="ts">
import type { HomeHeroContent } from '#shared/types/home-hero'
import { fieldsToHomeHighlights, type HomeHighlightsContent } from '#shared/types/home-highlights'

const { data: hero } = await useFetch<HomeHeroContent>('/api/content/home-hero')
const { data: highlights } = await useFetch<HomeHighlightsContent>('/api/content/home-highlights')
const previews = useState<Record<string, Record<string, string>>>('page-previews', () => ({}))
const displayedHero = computed(() => (previews.value['home-hero'] as unknown as HomeHeroContent) || hero.value)
const displayedHighlights = computed(() => (
  previews.value['home-highlights']
    ? fieldsToHomeHighlights(previews.value['home-highlights'])
    : highlights.value
))

useSeoMeta({
  title: 'Home',
  description: 'The official website of Stokes Valley Tennis Club.'
})
</script>

<template>
  <HomeHero v-if="displayedHero" :content="displayedHero" />
  <HomeHighlights v-if="displayedHighlights" :content="displayedHighlights" />
</template>
