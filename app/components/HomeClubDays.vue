<script setup lang="ts">
import { PhArrowRight, PhCalendarBlank } from '@phosphor-icons/vue'
import type { HomeClubDaysContent } from '#shared/types/home-club-days'

defineProps<{ content: HomeClubDaysContent }>()
const nuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <section id="club-days" class="club-days" aria-labelledby="club-days-heading">
    <header>
      <span>Get on court</span>
      <h2 id="club-days-heading">{{ content.heading }}</h2>
      <p>{{ content.introduction }}</p>
    </header>
    <div class="club-days__grid">
      <component
        :is="day.linkUrl ? nuxtLink : 'article'"
        v-for="day in content.days"
        :key="`${day.name}-${day.schedule}`"
        class="club-day"
        :to="day.linkUrl || undefined"
      >
        <PhCalendarBlank :size="25" weight="regular" />
        <div>
          <h3>{{ day.name }}</h3>
          <strong>{{ day.schedule }}</strong>
          <p v-if="day.note">{{ day.note }}</p>
        </div>
        <PhArrowRight v-if="day.linkUrl" class="club-day__arrow" :size="19" weight="bold" />
      </component>
    </div>
  </section>
</template>

<style scoped>
.club-days {
  padding: clamp(3.5rem, 7vw, 6.5rem) var(--space-page);
  background: var(--color-primary);
  color: white;
}

.club-days > header {
  width: min(100%, 760px);
  margin: 0 auto clamp(2rem, 4vw, 3.2rem);
  text-align: center;
}

.club-days > header span {
  color: var(--color-secondary);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.club-days h2 {
  margin: 0.35rem 0 0.8rem;
  font-family: var(--font-heading);
  font-size: clamp(2.6rem, 5vw, 4.8rem);
  line-height: 0.95;
  text-transform: uppercase;
}

.club-days > header p {
  margin: 0;
  color: rgb(255 255 255 / 72%);
  line-height: 1.6;
}

.club-days__grid {
  display: grid;
  width: min(100%, var(--content-width));
  margin: 0 auto;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.club-day {
  position: relative;
  display: grid;
  min-height: 180px;
  padding: clamp(1.2rem, 2.4vw, 1.8rem);
  border: 1px solid rgb(255 255 255 / 15%);
  border-radius: 4px;
  background: rgb(255 255 255 / 5%);
  color: white;
  align-content: start;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  text-decoration: none;
  transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;
}

a.club-day:hover,
a.club-day:focus-visible {
  border-color: var(--color-secondary);
  background: rgb(255 255 255 / 9%);
  transform: translateY(-3px);
}

.club-day > svg:first-child {
  color: var(--color-secondary);
}

.club-day h3 {
  margin: 0 0 0.4rem;
  font-family: var(--font-heading);
  font-size: 1.55rem;
  line-height: 1;
}

.club-day strong {
  color: var(--color-secondary);
  font-size: 0.82rem;
}

.club-day p {
  margin: 0.75rem 0 0;
  color: rgb(255 255 255 / 68%);
  font-size: 0.8rem;
  line-height: 1.5;
}

.club-day__arrow {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  color: var(--color-accent);
}

@container site-preview (max-width: 900px) {
  .club-days__grid { grid-template-columns: repeat(2, 1fr); }
}

@container site-preview (max-width: 560px) {
  .club-days { padding-block: 3rem; }
  .club-days__grid { grid-template-columns: 1fr; }
  .club-day { min-height: 0; }
}
</style>
