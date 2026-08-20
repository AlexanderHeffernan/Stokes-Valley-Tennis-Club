<script setup lang="ts">
import type { HomeHeroContent } from '#shared/types/home-hero'
import { fieldsToHomeHighlights, type HomeHighlightsContent } from '#shared/types/home-highlights'
import { fieldsToHomeExplore, type HomeExploreContent } from '#shared/types/home-explore'
import { fieldsToHomeSponsors, type HomeSponsorsContent } from '#shared/types/home-sponsors'

const { data: hero } = await useFetch<HomeHeroContent>('/api/content/home-hero')
const { data: highlights } = await useFetch<HomeHighlightsContent>('/api/content/home-highlights')
const { data: explore } = await useFetch<HomeExploreContent>('/api/content/home-explore')
const { data: sponsors } = await useFetch<HomeSponsorsContent>('/api/content/home-sponsors')
const previews = useState<Record<string, Record<string, string>>>('page-previews', () => ({}))
const displayedHero = computed(() => (previews.value['home-hero'] as unknown as HomeHeroContent) || hero.value)
const displayedHighlights = computed(() => (
  previews.value['home-highlights']
    ? fieldsToHomeHighlights(previews.value['home-highlights'])
    : highlights.value
))
const displayedExplore = computed(() => (
  previews.value['home-explore']
    ? fieldsToHomeExplore(previews.value['home-explore'])
    : explore.value
))
const displayedSponsors = computed(() => (
  previews.value['home-sponsors']
    ? fieldsToHomeSponsors(previews.value['home-sponsors'])
    : sponsors.value
))

useSeoMeta({
  title: 'Home',
  description: 'The official website of Stokes Valley Tennis Club.'
})
</script>

<template>
  <HomeHero v-if="displayedHero" :content="displayedHero" />
  <HomeHighlights v-if="displayedHighlights" :content="displayedHighlights" />
  <HomeExplore v-if="displayedExplore" :content="displayedExplore" />
  <HomeNewsPreview />
  <HomeSponsors v-if="displayedSponsors" :content="displayedSponsors" />
</template>
