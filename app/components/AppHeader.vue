<script setup lang="ts">
import { navigationItems } from '~/data/navigation'

const route = useRoute()
const isMenuOpen = ref(false)
const openMobileDropdown = ref<string | null>(null)

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}

const activeDropdown = () => {
  return navigationItems.find(item => item.children && isActive(item.to))?.to || null
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const toggleMobileDropdown = (path: string) => {
  openMobileDropdown.value = openMobileDropdown.value === path ? null : path
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeMenu()
}

watch(isMenuOpen, (isOpen) => {
  document.body.classList.toggle('menu-open', isOpen)
  if (isOpen) openMobileDropdown.value = activeDropdown()
})

watch(() => route.fullPath, closeMenu)

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.classList.remove('menu-open')
})
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <AppLogo class="site-header__logo" />

      <nav class="desktop-nav" aria-label="Main navigation">
        <div
          v-for="item in navigationItems"
          :key="item.to"
          class="desktop-nav__item"
          :class="{ 'desktop-nav__item--has-children': item.children }"
        >
          <NuxtLink
            class="desktop-nav__link"
            :class="{ 'desktop-nav__link--active': isActive(item.to) }"
            :to="item.to"
          >
            {{ item.label }}
            <BaseIcon v-if="item.children" name="chevron-down" :size="14" />
          </NuxtLink>

          <div v-if="item.children" class="desktop-nav__dropdown">
            <NuxtLink
              v-for="child in item.children"
              :key="child.to"
              :to="child.to"
            >
              {{ child.label }}
            </NuxtLink>
          </div>
        </div>
      </nav>

      <NuxtLink class="join-button join-button--desktop" to="/join">
        Join the Club
      </NuxtLink>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="isMenuOpen"
        aria-controls="mobile-menu"
        :aria-label="isMenuOpen ? 'Close menu' : 'Open menu'"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span />
        <span />
        <span />
      </button>
    </div>

    <Transition name="menu-reveal">
      <div v-show="isMenuOpen" id="mobile-menu" class="mobile-menu">
        <nav class="mobile-menu__nav" aria-label="Mobile navigation">
          <div
            v-for="(item, index) in navigationItems"
            :key="item.to"
            class="mobile-menu__item"
            :style="{ '--item-index': index }"
          >
            <div class="mobile-menu__row">
              <NuxtLink
                class="mobile-menu__link"
                :class="{ 'mobile-menu__link--active': isActive(item.to) }"
                :to="item.to"
              >
                {{ item.label }}
              </NuxtLink>
              <button
                v-if="item.children"
                class="mobile-menu__dropdown-toggle"
                type="button"
                :aria-expanded="openMobileDropdown === item.to"
                :aria-label="`Show ${item.label} pages`"
                @click="toggleMobileDropdown(item.to)"
              >
                <BaseIcon name="chevron-down" :size="22" />
              </button>
            </div>

            <div
              v-if="item.children"
              class="mobile-menu__submenu-wrap"
              :class="{ 'mobile-menu__submenu-wrap--open': openMobileDropdown === item.to }"
            >
              <div class="mobile-menu__submenu">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.to"
                  :class="{ 'mobile-menu__submenu-link--active': isActive(child.to) }"
                  :to="child.to"
                >
                  {{ child.label }}
                </NuxtLink>
              </div>
            </div>
          </div>

          <NuxtLink class="join-button join-button--mobile" to="/join">
            Join the Club
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.site-header {
  position: relative;
  z-index: 100;
  height: var(--header-height);
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.site-header__inner {
  display: flex;
  width: min(100%, var(--content-width));
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--space-page);
  align-items: center;
  gap: clamp(1rem, 2.4vw, 2.5rem);
}

.desktop-nav {
  display: flex;
  height: 100%;
  margin-left: auto;
  align-items: stretch;
  gap: clamp(0.9rem, 1.8vw, 2rem);
}

.desktop-nav__item {
  position: relative;
  display: flex;
  align-items: center;
}

.desktop-nav__link {
  position: relative;
  display: flex;
  height: 100%;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-decoration: none;
  text-transform: uppercase;
}

.desktop-nav__link::after {
  position: absolute;
  right: 0;
  bottom: 19px;
  left: 0;
  height: 4px;
  background: var(--color-accent);
  content: '';
  transform: scaleX(0);
  transform-origin: right;
  transition: transform var(--transition-fast);
}

.desktop-nav__link--active::after {
  transform: scaleX(1);
  transform-origin: left;
}

.desktop-nav__link:hover,
.desktop-nav__link:focus-visible {
  color: var(--color-secondary);
}

.desktop-nav__link--active:hover,
.desktop-nav__link--active:focus-visible {
  color: var(--color-text-inverse);
}

.desktop-nav__dropdown {
  position: absolute;
  top: 100%;
  left: -1rem;
  display: grid;
  width: max-content;
  min-width: 190px;
  padding: 0.65rem;
  border-top: 3px solid var(--color-accent);
  background: var(--color-primary);
  box-shadow: 0 16px 36px rgb(0 0 0 / 22%);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-8px);
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.desktop-nav__dropdown a {
  padding: 0.7rem 0.8rem;
  font-size: 0.875rem;
  text-decoration: none;
}

.desktop-nav__dropdown a:hover,
.desktop-nav__dropdown a:focus-visible {
  background: rgb(255 255 255 / 7%);
  color: var(--color-secondary);
}

.desktop-nav__item:hover .desktop-nav__dropdown,
.desktop-nav__item:focus-within .desktop-nav__dropdown {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.join-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 2px solid var(--color-secondary);
  border-radius: 3px;
  background: var(--color-secondary);
  color: var(--color-text);
  font-family: var(--font-heading);
  font-weight: 700;
  letter-spacing: 0.035em;
  text-decoration: none;
  text-transform: uppercase;
  transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

.join-button:hover,
.join-button:focus-visible {
  background: transparent;
  color: var(--color-secondary);
  transform: translateY(-2px);
}

.join-button--desktop {
  min-width: 136px;
  min-height: 48px;
  padding: 0.65rem 1rem;
}

.menu-toggle,
.mobile-menu {
  display: none;
}

@media (max-width: 1100px) {
  .desktop-nav,
  .join-button--desktop {
    display: none;
  }

  .site-header__logo {
    margin-right: auto;
  }

  .menu-toggle {
    position: relative;
    z-index: 2;
    display: flex;
    width: 48px;
    height: 48px;
    padding: 12px 8px;
    border: 0;
    background: transparent;
    cursor: pointer;
    flex-direction: column;
    justify-content: space-around;
  }

  .menu-toggle span {
    display: block;
    width: 100%;
    height: 2px;
    background: var(--color-text-inverse);
    transition: transform var(--transition-menu), opacity 200ms ease;
  }

  .menu-toggle[aria-expanded='true'] span:first-child {
    transform: translateY(8px) rotate(45deg);
  }

  .menu-toggle[aria-expanded='true'] span:nth-child(2) {
    opacity: 0;
    transform: scaleX(0);
  }

  .menu-toggle[aria-expanded='true'] span:last-child {
    transform: translateY(-8px) rotate(-45deg);
  }

  .mobile-menu {
    position: fixed;
    inset: var(--header-height) 0 0;
    display: block;
    overflow-y: auto;
    background: var(--color-primary);
  }

  .mobile-menu__nav {
    position: relative;
    display: flex;
    width: min(100%, 680px);
    min-height: 100%;
    margin: 0 auto;
    padding: clamp(2rem, 7vh, 5rem) var(--space-page) 2.5rem;
    flex-direction: column;
  }

  .mobile-menu__item {
    border-bottom: 1px solid var(--color-border);
    transition: opacity 320ms ease, transform 320ms ease;
    transition-delay: calc(var(--item-index) * 40ms + 80ms);
  }

  .mobile-menu__row {
    display: flex;
    align-items: center;
  }

  .mobile-menu__link {
    position: relative;
    flex: 1;
    padding: 0.55rem 0;
    font-family: var(--font-heading);
    font-size: clamp(2rem, 8vw, 3.5rem);
    font-weight: 600;
    line-height: 1;
    text-decoration: none;
    text-transform: uppercase;
  }

  .mobile-menu__link--active {
    color: var(--color-secondary);
  }

  .mobile-menu__link--active::before {
    display: inline-block;
    width: 1.5rem;
    height: 4px;
    margin-right: 0.65rem;
    background: var(--color-accent);
    content: '';
    vertical-align: middle;
  }

  .mobile-menu__dropdown-toggle {
    display: grid;
    width: 48px;
    height: 48px;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    place-items: center;
  }

  .mobile-menu__dropdown-toggle svg {
    transition: transform var(--transition-fast);
  }

  .mobile-menu__dropdown-toggle[aria-expanded='true'] svg {
    transform: rotate(180deg);
  }

  .mobile-menu__submenu-wrap {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition: grid-template-rows 320ms ease, opacity 240ms ease;
  }

  .mobile-menu__submenu-wrap--open {
    grid-template-rows: 1fr;
    opacity: 1;
  }

  .mobile-menu__submenu {
    display: grid;
    min-height: 0;
    padding-left: 2.2rem;
    overflow: hidden;
    gap: 0.15rem;
  }

  .mobile-menu__submenu a {
    padding: 0.5rem 0;
    color: rgb(255 255 255 / 72%);
    font-family: var(--font-heading);
    font-size: clamp(1.45rem, 5.5vw, 2rem);
    font-weight: 600;
    text-decoration: none;
    transition: color var(--transition-fast), transform var(--transition-fast);
  }

  .mobile-menu__submenu a:first-child {
    padding-top: 0.75rem;
  }

  .mobile-menu__submenu a:last-child {
    padding-bottom: 1rem;
  }

  .mobile-menu__submenu a:hover,
  .mobile-menu__submenu a:focus-visible {
    color: var(--color-secondary);
    transform: translateX(4px);
  }

  .mobile-menu__submenu .mobile-menu__submenu-link--active {
    color: var(--color-secondary);
  }

  .mobile-menu__submenu-link--active::before {
    display: inline-block;
    width: 0.75rem;
    height: 3px;
    margin-right: 0.5rem;
    background: var(--color-accent);
    content: '';
    vertical-align: middle;
  }

  .join-button--mobile {
    width: 100%;
    min-height: 56px;
    margin-top: 2rem;
    font-size: 1.15rem;
  }

  .menu-reveal-enter-active,
  .menu-reveal-leave-active {
    transition: opacity 480ms ease;
  }

  .menu-reveal-leave-active {
    pointer-events: none;
  }

  .menu-reveal-enter-from,
  .menu-reveal-leave-to {
    opacity: 0;
  }

  .menu-reveal-enter-from .mobile-menu__item,
  .menu-reveal-leave-to .mobile-menu__item,
  .menu-reveal-enter-from .join-button--mobile,
  .menu-reveal-leave-to .join-button--mobile {
    opacity: 0;
    transform: translateY(14px);
  }

  .menu-reveal-leave-active .mobile-menu__item {
    transition-delay: calc((5 - var(--item-index)) * 28ms);
  }
}

@media (prefers-reduced-motion: reduce) {
  .menu-toggle span,
  .mobile-menu__item,
  .mobile-menu__submenu-wrap,
  .menu-reveal-enter-active,
  .menu-reveal-leave-active {
    transition-duration: 1ms;
  }
}
</style>
