<script setup lang="ts">
import { PhStar } from '@phosphor-icons/vue'
import type { HomeHighlightsContent } from '#shared/types/home-highlights'
import { cmsIconComponents } from '~/data/cms-icon-components'

defineProps<{
  content: HomeHighlightsContent
}>()

const iconColor = (background: string) => {
  const value = background.replace('#', '')
  const red = Number.parseInt(value.slice(0, 2), 16)
  const green = Number.parseInt(value.slice(2, 4), 16)
  const blue = Number.parseInt(value.slice(4, 6), 16)
  return (red * 299 + green * 587 + blue * 114) / 1000 > 145 ? '#00251e' : '#ffffff'
}
</script>

<template>
  <section class="highlights" aria-label="Why join Stokes Valley Tennis Club">
    <div class="highlights__grid">
      <article v-for="(item, index) in content.items" :key="index" class="highlight">
        <div
          class="highlight__icon"
          :style="{ backgroundColor: item.color, color: iconColor(item.color) }"
        >
          <component :is="cmsIconComponents[item.icon] || PhStar" :size="31" weight="regular" />
        </div>
        <div>
          <h2>{{ item.heading }}</h2>
          <p>{{ item.text }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.highlights {
  position: relative;
  z-index: 2;
  padding: clamp(2.5rem, 5vw, 4.5rem) var(--space-page);
  background: var(--color-background);
}

.highlights__grid {
  display: grid;
  width: min(100%, var(--content-width));
  margin: 0 auto;
  grid-template-columns: repeat(4, 1fr);
}

.highlight {
  position: relative;
  display: grid;
  padding: 0 clamp(1rem, 2.5vw, 2.5rem);
  justify-items: center;
  text-align: center;
  gap: 1rem;
}

.highlight + .highlight::before {
  position: absolute;
  top: 1rem;
  bottom: 0;
  left: 0;
  width: 1px;
  background: #d9dfdd;
  content: '';
}

.highlight__icon {
  display: grid;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  place-items: center;
}

.highlight h2 {
  margin: 0;
  color: var(--color-primary);
  font-family: var(--font-heading);
  font-size: clamp(1.5rem, 2vw, 1.8rem);
  line-height: 1;
}

.highlight p {
  max-width: 260px;
  margin: 0.7rem auto 0;
  color: #394441;
  font-size: 0.9rem;
  line-height: 1.55;
}

@container site-preview (max-width: 760px) {
  .highlights {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  .highlights__grid {
    grid-template-columns: 1fr;
  }

  .highlight {
    grid-template-columns: 64px 1fr;
    padding: 1.35rem 0;
    align-items: center;
    justify-items: start;
    text-align: left;
  }

  .highlight + .highlight::before {
    top: 0;
    right: 0;
    bottom: auto;
    width: auto;
    height: 1px;
  }

  .highlight p {
    max-width: none;
    margin-top: 0.4rem;
  }
}
</style>
