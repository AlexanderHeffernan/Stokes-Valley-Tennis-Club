<script setup lang="ts">
import { PhArrowUpRight, PhStar } from '@phosphor-icons/vue'
import type { HomeExploreContent } from '#shared/types/home-explore'
import { cmsIconComponents } from '~/data/cms-icon-components'

defineProps<{
  content: HomeExploreContent
}>()

const isExternal = (url: string) => /^https:\/\//i.test(url)
</script>

<template>
  <section class="explore" aria-label="Explore Stokes Valley Tennis Club">
    <div class="explore__grid">
      <article v-for="(card, index) in content.cards" :key="index" class="explore-card">
        <div class="explore-card__media">
          <img v-if="card.imageUrl" :src="card.imageUrl" :alt="card.heading" loading="lazy">
          <component :is="cmsIconComponents[card.icon] || PhStar" class="explore-card__placeholder" :size="72" weight="thin" />
        </div>
        <div class="explore-card__content">
          <div class="explore-card__icon">
            <component :is="cmsIconComponents[card.icon] || PhStar" :size="25" weight="regular" />
          </div>
          <h2>{{ card.heading }}</h2>
          <p>{{ card.value }}</p>
          <NuxtLink
            :to="card.linkUrl"
            :target="isExternal(card.linkUrl) ? '_blank' : undefined"
            :rel="isExternal(card.linkUrl) ? 'noopener noreferrer' : undefined"
          >
            {{ card.linkText }}
            <PhArrowUpRight :size="17" weight="bold" />
          </NuxtLink>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.explore {
  padding: clamp(2.5rem, 6vw, 5.5rem) var(--space-page);
  background: #f2f5f4;
}

.explore__grid {
  display: grid;
  width: min(100%, var(--content-width));
  margin: 0 auto;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(0.8rem, 1.5vw, 1.4rem);
}

.explore-card {
  min-width: 0;
  overflow: hidden;
  border-radius: 4px;
  background: white;
  box-shadow: 0 12px 30px rgb(0 37 30 / 9%);
}

.explore-card__media {
  position: relative;
  display: grid;
  height: clamp(180px, 18vw, 270px);
  overflow: hidden;
  background: var(--color-primary);
  color: rgb(255 255 255 / 18%);
  place-items: center;
}

.explore-card__media img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 450ms ease;
}

.explore-card:hover .explore-card__media img {
  transform: scale(1.035);
}

.explore-card__placeholder {
  position: relative;
}

.explore-card__media:has(img) .explore-card__placeholder {
  display: none;
}

.explore-card__content {
  position: relative;
  padding: 2.2rem clamp(1.1rem, 2vw, 1.6rem) 1.5rem;
}

.explore-card__icon {
  position: absolute;
  top: 0;
  display: grid;
  width: 48px;
  height: 48px;
  border: 4px solid white;
  border-radius: 50%;
  background: var(--color-secondary);
  color: var(--color-primary);
  transform: translateY(-50%);
  place-items: center;
}

.explore-card h2 {
  margin: 0;
  color: var(--color-primary);
  font-family: var(--font-heading);
  font-size: clamp(1.55rem, 2vw, 2rem);
  line-height: 1;
}

.explore-card p {
  min-height: 4.4em;
  margin: 0.75rem 0 1.15rem;
  color: #49534f;
  font-size: 0.88rem;
  line-height: 1.55;
}

.explore-card a {
  display: inline-flex;
  color: var(--color-accent);
  align-items: center;
  font-size: 0.82rem;
  font-weight: 800;
  gap: 0.35rem;
  text-decoration: none;
}

.explore-card a:hover,
.explore-card a:focus-visible {
  text-decoration: underline;
  text-underline-offset: 4px;
}

@container site-preview (max-width: 1000px) {
  .explore__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .explore-card__media {
    height: 220px;
  }
}

@container site-preview (max-width: 560px) {
  .explore {
    padding-block: 2rem;
  }

  .explore__grid {
    grid-template-columns: 1fr;
  }

  .explore-card__media {
    height: 210px;
  }

  .explore-card p {
    min-height: 0;
  }
}
</style>
