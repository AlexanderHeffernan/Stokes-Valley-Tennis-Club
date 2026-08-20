<script setup lang="ts">
import type { HomeSponsorsContent } from '#shared/types/home-sponsors'

const props = defineProps<{
  content: HomeSponsorsContent
}>()

const viewport = ref<HTMLElement | null>(null)
const firstGroup = ref<HTMLElement | null>(null)
const isOverflowing = ref(false)
const isMobile = ref(false)
const activeSponsor = ref<number | null>(null)
let resizeObserver: ResizeObserver | undefined

const measure = () => {
  if (!viewport.value || !firstGroup.value) return
  isMobile.value = viewport.value.clientWidth <= 560
  isOverflowing.value = !isMobile.value && firstGroup.value.scrollWidth > viewport.value.clientWidth
}

onMounted(() => {
  resizeObserver = new ResizeObserver(measure)
  if (viewport.value) resizeObserver.observe(viewport.value)
  if (firstGroup.value) resizeObserver.observe(firstGroup.value)
  measure()
})

onBeforeUnmount(() => resizeObserver?.disconnect())
watch(() => props.content.sponsors.length, () => nextTick(measure))

const duration = computed(() => `${Math.max(18, props.content.sponsors.length * 5)}s`)

const handleSponsorClick = (index: number, hasDetails: boolean) => {
  if (!hasDetails) return
  activeSponsor.value = activeSponsor.value === index ? null : index
}
</script>

<template>
  <section class="sponsors" aria-labelledby="sponsors-heading">
    <h2 id="sponsors-heading">Proudly sponsored by</h2>

    <div v-if="content.sponsors.length" ref="viewport" class="sponsors__viewport">
      <div
        class="sponsors__track"
        :class="{ 'sponsors__track--moving': isOverflowing }"
        :style="{ '--sponsor-duration': duration }"
      >
        <div ref="firstGroup" class="sponsors__group">
          <div
            v-for="(sponsor, index) in content.sponsors"
            :key="`${sponsor.name}-${sponsor.websiteUrl}`"
            class="sponsors__item"
            :class="{ 'sponsors__item--active': activeSponsor === index }"
          >
            <button
              class="sponsors__logo"
              type="button"
              :aria-expanded="Boolean((sponsor.message || sponsor.websiteUrl) && activeSponsor === index)"
              :aria-label="`Show details about ${sponsor.name}`"
              @click="handleSponsorClick(index, Boolean(sponsor.message || sponsor.websiteUrl))"
            >
              <img :src="sponsor.imageUrl" :alt="`${sponsor.name} logo`" loading="lazy">
            </button>
            <div v-if="sponsor.message || sponsor.websiteUrl" class="sponsors__message" role="tooltip">
              <p v-if="sponsor.message">{{ sponsor.message }}</p>
              <a v-if="sponsor.websiteUrl" :href="sponsor.websiteUrl" target="_blank" rel="noopener noreferrer">Check them out here</a>
            </div>
          </div>
        </div>
        <div v-if="isOverflowing" class="sponsors__group" aria-hidden="true">
          <div v-for="sponsor in content.sponsors" :key="`${sponsor.name}-${sponsor.websiteUrl}-copy`" class="sponsors__item">
            <img :src="sponsor.imageUrl" alt="" loading="lazy">
          </div>
        </div>
      </div>
    </div>
    <p v-else class="sponsors__empty">Sponsor logos coming soon.</p>
  </section>
</template>

<style scoped>
.sponsors {
  padding: clamp(3rem, 6vw, 5rem) 0;
  overflow: hidden;
  background: #f2f5f4;
}

.sponsors h2 {
  margin: 0 0 clamp(2rem, 4vw, 3.2rem);
  padding: 0 var(--space-page);
  color: var(--color-primary);
  font-family: var(--font-heading);
  font-size: clamp(2.2rem, 4.5vw, 4rem);
  line-height: 1;
  text-align: center;
  text-transform: uppercase;
}

.sponsors h2::after {
  display: block;
  width: 54px;
  height: 4px;
  margin: 0.8rem auto 0;
  background: var(--color-accent);
  content: '';
}

.sponsors__viewport {
  width: 100%;
  padding-top: 260px;
  margin-top: -260px;
  overflow: hidden;
}

.sponsors__track {
  display: flex;
  width: max-content;
  min-width: 100%;
}

.sponsors__track--moving {
  animation: sponsor-conveyor var(--sponsor-duration) linear infinite;
}

.sponsors__track--moving:hover {
  animation-play-state: paused;
}

.sponsors__group {
  display: flex;
  min-width: 100%;
  padding: 0 clamp(1.5rem, 4vw, 4rem);
  align-items: center;
  justify-content: space-evenly;
  gap: clamp(2.5rem, 6vw, 6rem);
}

.sponsors__track--moving .sponsors__group {
  min-width: auto;
  padding-right: clamp(2.5rem, 6vw, 6rem);
  justify-content: flex-start;
}

.sponsors__item {
  position: relative;
  display: grid;
  width: clamp(130px, 14vw, 210px);
  height: 100px;
  flex: 0 0 auto;
  place-items: center;
}

.sponsors__logo {
  display: grid;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  place-items: center;
}

.sponsors__message {
  position: absolute;
  z-index: 2;
  bottom: calc(100% - 4px);
  left: 50%;
  width: min(300px, 85vw);
  padding: 0.75rem 0.85rem;
  border-radius: 3px;
  background: var(--color-primary);
  box-shadow: 0 8px 24px rgb(0 37 30 / 20%);
  color: white;
  font-size: 0.76rem;
  font-weight: 500;
  line-height: 1.45;
  opacity: 0;
  pointer-events: none;
  text-align: left;
  transform: translate(-50%, 6px);
  transition: opacity 180ms ease, transform 180ms ease;
}

.sponsors__message::before {
  position: absolute;
  right: 0;
  bottom: -16px;
  left: 0;
  height: 18px;
  content: '';
}

.sponsors__message p {
  margin: 0;
}

.sponsors__message a {
  display: inline-block;
  margin-top: 0.6rem;
  color: var(--color-secondary);
  font-weight: 800;
  pointer-events: auto;
  text-underline-offset: 3px;
}

.sponsors__message::after {
  position: absolute;
  top: 100%;
  left: 50%;
  border: 6px solid transparent;
  border-top-color: var(--color-primary);
  content: '';
  transform: translateX(-50%);
}

.sponsors__item:hover .sponsors__message,
.sponsors__item:focus-within .sponsors__message,
.sponsors__item--active .sponsors__message {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, 0);
}

.sponsors img {
  max-width: 100%;
  max-height: 78px;
  object-fit: contain;
  transition: transform 180ms ease;
}

.sponsors__item:hover img,
.sponsors__item:focus-visible img {
  transform: scale(1.04);
}

@container site-preview (max-width: 560px) {
  .sponsors__viewport {
    padding: 200px var(--space-page) 0;
    margin-top: -200px;
  }

  .sponsors__track {
    display: block;
    width: 100%;
  }

  .sponsors__group {
    display: grid;
    width: 100%;
    min-width: 0;
    padding: 0;
    align-items: start;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .sponsors__item {
    width: 100%;
    height: auto;
    min-height: 100px;
    padding: 0.6rem;
    border: 1px solid #dfe5e3;
    border-radius: 3px;
    background: white;
  }

  .sponsors__message {
    bottom: calc(100% - 2px);
    width: min(300px, calc(200% + 1rem));
  }

  .sponsors__item:nth-child(odd) .sponsors__message {
    right: auto;
    left: 0;
    transform: translateY(6px);
  }

  .sponsors__item:nth-child(even) .sponsors__message {
    right: 0;
    left: auto;
    transform: translateY(6px);
  }

  .sponsors__item:nth-child(odd) .sponsors__message::after {
    left: 25%;
  }

  .sponsors__item:nth-child(even) .sponsors__message::after {
    left: 75%;
  }

  .sponsors__item:nth-child(odd):hover .sponsors__message,
  .sponsors__item:nth-child(odd):focus-within .sponsors__message,
  .sponsors__item:nth-child(odd).sponsors__item--active .sponsors__message,
  .sponsors__item:nth-child(even):hover .sponsors__message,
  .sponsors__item:nth-child(even):focus-within .sponsors__message,
  .sponsors__item:nth-child(even).sponsors__item--active .sponsors__message {
    transform: translateY(0);
  }
}

.sponsors__empty {
  margin: 0;
  color: #69736f;
  text-align: center;
}

@keyframes sponsor-conveyor {
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .sponsors__track--moving {
    animation-play-state: paused;
  }
}
</style>
