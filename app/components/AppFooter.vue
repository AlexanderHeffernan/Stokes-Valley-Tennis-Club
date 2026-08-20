<script setup lang="ts">
import { PhEnvelopeSimple, PhFacebookLogo, PhMapPin, PhPhone } from '@phosphor-icons/vue'
import type { SiteFooterContent } from '#shared/types/site-footer'

defineProps<{
  content: SiteFooterContent
}>()

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Juniors', to: '/juniors' },
  { label: 'Seniors', to: '/seniors' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' }
]

const phoneHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, '')}`
</script>

<template>
  <footer class="footer">
    <div class="footer__grid">
      <div class="footer__brand">
        <div>
          <img src="/images/svtc-logo.jpeg" alt="Stokes Valley Tennis Club logo" width="320" height="320">
          <strong><span>Stokes Valley</span>Tennis Club</strong>
        </div>
        <nav class="footer__socials" aria-label="Social and email links">
          <a v-if="content.facebookUrl" :href="content.facebookUrl" target="_blank" rel="noopener noreferrer" aria-label="Stokes Valley Tennis Club on Facebook">
            <PhFacebookLogo :size="22" weight="bold" />
          </a>
          <a v-if="content.email" :href="`mailto:${content.email}`" aria-label="Email Stokes Valley Tennis Club">
            <PhEnvelopeSimple :size="22" weight="bold" />
          </a>
        </nav>
      </div>

      <nav class="footer__column" aria-label="Footer navigation">
        <h2>Quick links</h2>
        <NuxtLink v-for="link in quickLinks" :key="link.to" :to="link.to">{{ link.label }}</NuxtLink>
      </nav>

      <div class="footer__column footer__contact">
        <h2>Contact us</h2>
        <p v-if="content.address"><PhMapPin :size="20" weight="fill" /><span>{{ content.address }}</span></p>
        <a v-if="content.email" :href="`mailto:${content.email}`"><PhEnvelopeSimple :size="20" weight="fill" /><span>{{ content.email }}</span></a>
        <a v-if="content.phone" :href="phoneHref(content.phone)"><PhPhone :size="20" weight="fill" /><span>{{ content.phone }}</span></a>
      </div>

      <div class="footer__column footer__cta">
        <h2>{{ content.ctaHeading }}</h2>
        <p>{{ content.ctaText }}</p>
        <NuxtLink to="/contact">Get in touch</NuxtLink>
      </div>
    </div>

  </footer>
</template>

<style scoped>
.footer {
  padding: clamp(2.8rem, 5vw, 4.5rem) var(--space-page);
  border-bottom: 4px solid var(--color-accent);
  background: var(--color-primary);
  color: white;
}

.footer__grid {
  display: grid;
  width: min(100%, var(--content-width));
  margin: 0 auto;
  grid-template-columns: 1.25fr 0.7fr 1fr 1fr;
  gap: clamp(2rem, 4vw, 5rem);
}

.footer__brand > div {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.footer__brand img {
  width: 74px;
  height: 74px;
  border: 1px solid rgb(255 255 255 / 45%);
  object-fit: cover;
}

.footer__brand strong {
  display: flex;
  color: var(--color-secondary);
  flex-direction: column;
  font-family: var(--font-heading);
  font-size: 1.45rem;
  line-height: 1;
  text-transform: uppercase;
}

.footer__brand strong span {
  margin-bottom: 0.3rem;
  color: white;
}

.footer__socials {
  display: flex;
  margin-top: 1.5rem;
  gap: 0.65rem;
}

.footer__socials a {
  display: grid;
  width: 42px;
  height: 42px;
  border: 1px solid var(--color-secondary);
  border-radius: 50%;
  color: var(--color-secondary);
  place-items: center;
}

.footer h2 {
  margin: 0 0 1rem;
  color: var(--color-secondary);
  font-family: var(--font-heading);
  font-size: 1.35rem;
  line-height: 1;
  text-transform: uppercase;
}

.footer__column {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 0.65rem;
}

.footer__column > a:not(.footer__cta > a) {
  color: rgb(255 255 255 / 82%);
  font-size: 0.86rem;
  text-decoration: none;
}

.footer__column > a:hover,
.footer__column > a:focus-visible {
  color: var(--color-secondary);
}

.footer__contact p,
.footer__contact a {
  display: flex;
  margin: 0;
  color: rgb(255 255 255 / 82%);
  align-items: flex-start;
  font-size: 0.84rem;
  gap: 0.65rem;
  line-height: 1.5;
  text-decoration: none;
}

.footer__contact svg {
  margin-top: 0.05rem;
  color: var(--color-secondary);
  flex: 0 0 auto;
}

.footer__contact p span {
  white-space: pre-line;
}

.footer__cta p {
  margin: 0;
  color: rgb(255 255 255 / 78%);
  font-size: 0.86rem;
  line-height: 1.55;
}

.footer__cta > a {
  display: inline-flex;
  min-height: 44px;
  margin-top: 0.4rem;
  padding: 0.7rem 1.2rem;
  border-radius: 3px;
  background: var(--color-secondary);
  color: var(--color-primary);
  align-items: center;
  font-size: 0.8rem;
  font-weight: 800;
  text-decoration: none;
  text-transform: uppercase;
}

@container site-preview (max-width: 850px) {
  .footer__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container site-preview (max-width: 520px) {
  .footer__grid {
    grid-template-columns: 1fr;
  }

  .footer__brand {
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgb(255 255 255 / 12%);
  }

}
</style>
