<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

useSeoMeta({ title: 'CMS Login', robots: 'noindex, nofollow' })

onMounted(async () => {
  const session = await $fetch('/api/admin/session')
  if (session) await navigateTo('/')
})

const login = async () => {
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    await navigateTo('/')
  } catch (error: unknown) {
    const response = error as { data?: { statusMessage?: string } }
    errorMessage.value = response.data?.statusMessage || 'Unable to sign in'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <form class="login-card" @submit.prevent="login">
      <AppLogo class="login-card__logo" />
      <div>
        <p class="login-card__eyebrow">Content management</p>
        <h1>Welcome back</h1>
        <p>Sign in to edit the Stokes Valley Tennis Club website.</p>
      </div>

      <label>
        Username
        <input v-model="username" name="username" autocomplete="username" required>
      </label>
      <label>
        Password
        <input v-model="password" name="password" type="password" autocomplete="current-password" required>
      </label>
      <p v-if="errorMessage" class="login-card__error" role="alert">{{ errorMessage }}</p>
      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  display: grid;
  min-height: 100vh;
  padding: 1.25rem;
  background: var(--color-primary);
  place-items: center;
}

.login-card {
  display: grid;
  width: min(100%, 430px);
  padding: clamp(1.5rem, 5vw, 2.75rem);
  border-top: 4px solid var(--color-accent);
  border-radius: 4px;
  background: white;
  box-shadow: 0 24px 80px rgb(0 0 0 / 25%);
  gap: 1.25rem;
}

.login-card__logo :deep(.brand__name) {
  color: var(--color-primary);
}

.login-card__eyebrow {
  margin: 0 0 0.25rem;
  color: var(--color-accent);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-card h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 2.75rem;
  line-height: 1;
}

.login-card p {
  margin-bottom: 0;
  line-height: 1.5;
}

.login-card label {
  display: grid;
  font-size: 0.85rem;
  font-weight: 700;
  gap: 0.45rem;
}

.login-card input {
  min-height: 48px;
  padding: 0.75rem;
  border: 1px solid #b9c2c0;
  border-radius: 3px;
  color: var(--color-text);
  font-size: 1rem;
}

.login-card input:focus {
  border-color: var(--color-primary);
  outline: 3px solid rgb(218 223 60 / 45%);
}

.login-card button {
  min-height: 50px;
  border: 0;
  border-radius: 3px;
  background: var(--color-secondary);
  color: var(--color-text);
  cursor: pointer;
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
}

.login-card button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.login-card__error {
  color: #a92300;
  font-size: 0.875rem;
}
</style>
