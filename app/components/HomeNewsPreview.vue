<script setup lang="ts">
import { PhCalendarDots, PhNewspaper, PhTennisBall } from '@phosphor-icons/vue'

const previews = [
  {
    icon: PhNewspaper,
    category: 'Club news',
    heading: 'The latest from around the club',
    text: 'Club announcements, results and important updates will appear here.'
  },
  {
    icon: PhTennisBall,
    category: 'On court',
    heading: 'Tennis updates and results',
    text: 'Follow interclub teams, tournaments and everything happening on court.'
  },
  {
    icon: PhCalendarDots,
    category: 'Events',
    heading: 'What’s coming up',
    text: 'Keep up with upcoming events, social tennis and key club dates.'
  }
]
</script>

<template>
  <section class="news-preview" aria-labelledby="news-preview-heading">
    <header class="news-preview__header">
      <div>
        <span>Stay up to date</span>
        <h2 id="news-preview-heading">Latest news</h2>
      </div>
      <p>News posts are coming soon.</p>
    </header>

    <div class="news-preview__grid">
      <article v-for="preview in previews" :key="preview.category" class="news-card">
        <div class="news-card__visual">
          <component :is="preview.icon" :size="55" weight="thin" />
          <span>Coming soon</span>
        </div>
        <div class="news-card__content">
          <span>{{ preview.category }}</span>
          <h3>{{ preview.heading }}</h3>
          <p>{{ preview.text }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.news-preview {
  padding: clamp(3rem, 7vw, 6rem) var(--space-page);
  background: white;
}

.news-preview__header {
  display: flex;
  width: min(100%, var(--content-width));
  margin: 0 auto clamp(1.8rem, 4vw, 3rem);
  align-items: end;
  justify-content: space-between;
  gap: 2rem;
}

.news-preview__header span,
.news-card__content > span {
  color: var(--color-accent);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.news-preview__header h2 {
  margin: 0.25rem 0 0;
  color: var(--color-primary);
  font-family: var(--font-heading);
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  line-height: 0.95;
  text-transform: uppercase;
}

.news-preview__header > p {
  margin: 0 0 0.25rem;
  color: #66716e;
  font-size: 0.9rem;
}

.news-preview__grid {
  display: grid;
  width: min(100%, var(--content-width));
  margin: 0 auto;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(1rem, 2vw, 1.6rem);
}

.news-card {
  overflow: hidden;
  border: 1px solid #e0e5e3;
  border-radius: 4px;
  background: white;
}

.news-card__visual {
  position: relative;
  display: grid;
  min-height: 170px;
  background: var(--color-primary);
  color: rgb(255 255 255 / 22%);
  place-items: center;
}

.news-card__visual::after {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 42%;
  height: 6px;
  background: var(--color-secondary);
  content: '';
}

.news-card__visual span {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.35rem 0.55rem;
  border-radius: 2px;
  background: var(--color-accent);
  color: white;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.news-card__content {
  padding: clamp(1.2rem, 2.5vw, 1.8rem);
}

.news-card h3 {
  margin: 0.5rem 0 0;
  color: var(--color-primary);
  font-family: var(--font-heading);
  font-size: clamp(1.5rem, 2.4vw, 2rem);
  line-height: 1.05;
}

.news-card p {
  margin: 0.8rem 0 0;
  color: #4f5a56;
  font-size: 0.88rem;
  line-height: 1.55;
}

@container site-preview (max-width: 760px) {
  .news-preview__header {
    display: block;
  }

  .news-preview__header > p {
    margin-top: 0.75rem;
  }

  .news-preview__grid {
    grid-template-columns: 1fr;
  }

  .news-card {
    display: grid;
    grid-template-columns: minmax(120px, 34%) 1fr;
  }

  .news-card__visual {
    min-height: 190px;
  }
}

@container site-preview (max-width: 430px) {
  .news-card {
    display: block;
  }

  .news-card__visual {
    min-height: 150px;
  }
}
</style>
