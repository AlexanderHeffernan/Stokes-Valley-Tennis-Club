<template>
  <NuxtLink class="brand" to="/" aria-label="Stokes Valley Tennis Club home">
    <img
      class="brand__image"
      src="/images/svtc-logo.jpeg"
      alt=""
      width="320"
      height="320"
    >
    <span class="brand__name">
      <span>Stokes Valley</span>
      <strong>Tennis Club</strong>
    </span>
  </NuxtLink>
</template>

<style scoped>
.brand {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.8rem;
  text-decoration: none;
}

.brand__image {
  width: 64px;
  height: 64px;
  border: 1px solid rgb(255 255 255 / 70%);
  object-fit: cover;
}

.brand__name {
  display: flex;
  flex-direction: column;
  color: var(--color-text-inverse);
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 0.95;
  text-transform: uppercase;
  white-space: nowrap;
}

.brand__name strong {
  margin-top: 0.3rem;
  color: var(--color-secondary);
}

@media (max-width: 1100px) {
  .brand__image {
    width: 52px;
    height: 52px;
  }

  .brand__name {
    font-size: 1.05rem;
  }
}

@media (max-width: 380px) {
  .brand {
    gap: 0.55rem;
  }

  .brand__image {
    width: 46px;
    height: 46px;
  }

  .brand__name {
    font-size: 0.92rem;
  }
}
</style>
