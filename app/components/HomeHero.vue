<script setup lang="ts">
import type { HomeHeroContent } from '#shared/types/home-hero'

defineProps<{
  content: HomeHeroContent
}>()
</script>

<template>
  <section class="home-hero">
    <img
      v-if="content.imageUrl"
      class="home-hero__image"
      :src="content.imageUrl"
      alt=""
    >
    <div v-if="content.imageUrl" class="home-hero__overlay" />
    <div class="home-hero__content">
      <h1>
        {{ content.headline1 }}
        <span>{{ content.headline2 }}</span>
      </h1>
      <p>{{ content.subheading }}</p>
      <NuxtLink class="home-hero__cta" to="/join">Join the Club</NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.home-hero {
  position: relative;
  display: grid;
  min-height: clamp(540px, calc(100svh - var(--header-height)), 820px);
  overflow: hidden;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  isolation: isolate;
  place-items: center start;
}

.home-hero__image,
.home-hero__overlay {
  position: absolute;
  z-index: -2;
  inset: 0;
  width: 100%;
  height: 100%;
}

.home-hero__image {
  object-fit: cover;
  object-position: center;
}

.home-hero__overlay {
  z-index: -1;
  background: linear-gradient(90deg, rgb(0 37 30 / 92%) 0%, rgb(0 37 30 / 65%) 48%, rgb(0 37 30 / 16%) 78%);
}

.home-hero__content {
  width: min(100%, var(--content-width));
  margin: 0 auto;
  padding: clamp(4rem, 9vw, 8rem) var(--space-page);
}

.home-hero h1 {
  max-width: 820px;
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(4rem, 8vw, 7.5rem);
  font-weight: 700;
  letter-spacing: -0.015em;
  line-height: 0.86;
}

.home-hero h1 span {
  display: block;
  margin-top: 0.12em;
  color: var(--color-secondary);
}

.home-hero p {
  max-width: 620px;
  margin: 1.75rem 0 2rem;
  font-size: clamp(1.05rem, 2vw, 1.35rem);
  line-height: 1.55;
  white-space: pre-line;
}

.home-hero__cta {
  display: inline-flex;
  min-width: 175px;
  min-height: 56px;
  padding: 0.8rem 1.5rem;
  border: 2px solid var(--color-secondary);
  border-radius: 3px;
  justify-content: center;
  align-items: center;
  background: var(--color-secondary);
  color: var(--color-text);
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.035em;
  text-decoration: none;
  text-transform: uppercase;
  transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

.home-hero__cta:hover,
.home-hero__cta:focus-visible {
  background: var(--color-primary);
  color: var(--color-secondary);
  transform: translateY(-2px);
}

@container site-preview (max-width: 700px) {
  .home-hero {
    min-height: calc(100svh - var(--header-height));
    align-items: end;
  }

  .home-hero__overlay {
    background: linear-gradient(0deg, rgb(0 37 30 / 96%) 0%, rgb(0 37 30 / 66%) 62%, rgb(0 37 30 / 18%) 100%);
  }

  .home-hero__content {
    padding-top: 8rem;
    padding-bottom: 3rem;
  }

  .home-hero h1 {
    font-size: clamp(3.5rem, 18vw, 5.5rem);
  }
}
</style>
